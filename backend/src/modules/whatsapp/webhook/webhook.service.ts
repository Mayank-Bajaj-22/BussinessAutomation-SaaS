import { WebhookEvent } from "@prisma/client";
import { AppError } from "../../../common/errors/AppError.js";
import { env } from "../../../config/env.config.js";
import { enqueueWebhookEvent } from "../../../jobs/queues/webhook.queue.js";
import { IWhatsAppAccountRepository } from "../account/whatsapp-account.repository.interface.js";
import { ContactService } from "../contact/contact.service.js";
import { ConversationService } from "../conversation/conversation.service.js";
import { MessageService } from "../message/message.service.js";
import { createMessageEventKey, createStatusEventKey } from "./webhook-event-key.js";
import { WebhookEventService } from "./webhook-event.service.js";
import { mapMetaStatusToMessageStatus } from "./webhook-status.mapper.js";
import { WEBHOOK_EVENT_TYPES, WEBHOOK_MODES } from "./webhook.constants.js";
import { verifyWhatsAppWebhookSignature } from "./webhook.crypto.js";
import { WhatsAppWebhookChange, WhatsAppWebhookContact, WhatsAppWebhookEntry, WhatsAppWebhookMessage, WhatsAppWebhookPayload, WhatsAppWebhookStatus } from "./webhook.types.js";
import { IncomingMessageHandler } from "../incoming/incoming-message.handler.js";

export interface VerifyWebhookInput {
    mode?: string;
    verifyToken?: string;
    challenge?: string;
}

export interface ProcessWebhookInput {
    rawBody: Buffer;
    signature?: string;
    payload: WhatsAppWebhookPayload;
}

export class WebhookService {
    constructor(
        private readonly whatsappAccountRepository: IWhatsAppAccountRepository,
        private readonly contactService: ContactService,
        private readonly conversationService: ConversationService,
        private readonly messageService: MessageService,
        private readonly webhookEventService: WebhookEventService,
        private readonly incomingMessageHandler: IncomingMessageHandler,
    ) {}

    verifyWebhook(
        input: VerifyWebhookInput,
    ): string {
        // Meta must send: hub.mode, hub.verify_token, hub.challenge 
        if (!input.mode) {
            throw new AppError(
                "Webhook mode is missing",
                400,
            );
        }

        if (!input.verifyToken) {
            throw new AppError(
                "Webhook verify token is missing",
                400,
            );
        }

        if (!input.challenge) {
            throw new AppError(
                "Webhook challenge is missing",
                400,
            );
        }

        if (input.mode !== WEBHOOK_MODES.SUBSCRIBE) {
            throw new AppError(
                "Invalid webhook mode",
                403,
            );
        }

        // verify token
        const expectedToken = 
            env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

        if (!expectedToken) {
            throw new AppError(
                "WhatsApp webhook verify token is not configured",
                500,
            );
        }

        if (input.verifyToken !== expectedToken) {
            throw new AppError(
                "Invalid webhook verify token",
                403,
            );
        }

        /**
            * Everything is valid.
            *
            * Meta expects the challenge as plain text.
        */

        return input.challenge;
    }

    async processWebhook(
        input: ProcessWebhookInput,
    ) {
        // 1. verify meta signature

        const isValidateSignature =
            verifyWhatsAppWebhookSignature(
                input.rawBody,
                input.signature,
            );

        if (!isValidateSignature) {
            throw new AppError(
                "Invalid WhatsApp webhook signature",
                401,
            );
        }

        // 2. validate webhook object

        if (input.payload.object !== "whatsapp_business_account") {
            throw new AppError(
                "Invalid WhatsApp webhook object",
                400,
            );
        }

        const entries = 
            input.payload.entry ?? [];

        for (const entry of entries) {
            await this.enqueueEntryEvents(entry);
        }

        return {
            received: true,
        };
    }

    private async enqueueEntryEvents(
        entry: WhatsAppWebhookEntry,
    ): Promise<void> {
        const changes =
            entry.changes ?? [];

        for (const change of changes) {
            await this.enqueueChangeEvents(change);
        }
    }

    private async enqueueChangeEvents(
        change: WhatsAppWebhookChange,
    ): Promise<void> {
        if (change.field !== "messages") {
            return;
        }

        const value = change.value;

        if (!value) {
            return;
        }

        const phoneNumberId = 
            value.metadata?.phone_number_id;

        if (!phoneNumberId) {
            throw new AppError(
                "WhatsApp phone number ID missing from webhook",
                400,
            );
        }

        const account = 
            await this.whatsappAccountRepository.findByPhoneNumberId(
                phoneNumberId,
            );

        if (!account) {
            throw new AppError(
                "WhatsApp account not found for webhook",
                404,
            );
        }

        if (account.status !== "ACTIVE") {
            return;
        }

        const contacts =
            value.contacts ?? [];

        for (const incomingMessage of value.messages ?? []) {
            await this.enqueueIncomingMessage(
                account.id,
                incomingMessage,
                contacts,
            );
        }

        for (const status of value.statuses ?? []) {
            await this.enqueueMessageStatus(
                account.id,
                status,
            );
        }
    }

    private async enqueueIncomingMessage(
        whatsappAccountId: string,
        incomingMessage: WhatsAppWebhookMessage,
        contacts: WhatsAppWebhookContact[],
    ): Promise<void> {
        const providerMessageId =
            incomingMessage.id;

        if (!providerMessageId) {
            throw new AppError(
                "Incoming WhatsApp message ID is missing",
                400,
            );
        }

        const eventKey =
            createMessageEventKey(providerMessageId);

        const payload = { incomingMessage, contacts };

        const { event, isDuplicate } = 
            await this.webhookEventService.registerEvent({
                eventKey,
                eventType: WEBHOOK_EVENT_TYPES.INCOMING_MESSAGE,
                whatsappAccountId,
                payload: JSON.parse(
                    JSON.stringify(payload),
                ),
            });

        /*
            * IMPORTANT:
            *
            * Only PROCESSED events are duplicates.
            * RECEIVED / FAILED events must be retried.
        */

        if (isDuplicate) {
            return;
        }

        await enqueueWebhookEvent(
            event.id,
        );
    }

    private async enqueueMessageStatus(
        whatsappAccountId: string,
        status: WhatsAppWebhookStatus,
    ): Promise<void> {
        const providerMessageId =
            status.id;

        const metaStatus =
            status.status;

        if (!providerMessageId || !metaStatus) {
            return;
        }

        const eventKey =
            createStatusEventKey(providerMessageId, metaStatus);

        const { event, isDuplicate } =
            await this.webhookEventService.registerEvent({
                eventKey,
                eventType:
                    WEBHOOK_EVENT_TYPES.MESSAGE_STATUS,
                whatsappAccountId,
                payload: JSON.parse(
                    JSON.stringify(status),
                ),
            });

        if (isDuplicate) {
            return;
        }

        await enqueueWebhookEvent(
            event.id,
        );
    }

    private async processIncomingMessage(
        account: any,
        incomingMessage: WhatsAppWebhookMessage,
        contacts: WhatsAppWebhookContact[],
    ) {
        const providerMessageId =
            incomingMessage.id;

        const phoneNumber =
            incomingMessage.from;

        if (!providerMessageId) {
            throw new AppError(
                "Incoming WhatsApp message ID is missing",
                400,
            );
        }

        if (!phoneNumber) {
            throw new AppError(
                "Incoming WhatsApp sender phone number is missing",
                400,
            );
        }

        // Message-level idempotency
        const existingMessage =
            await this.messageService.findMessageProviderId(
                providerMessageId,
            );

        if (existingMessage) {
            return existingMessage;
        }

        // Currently only TEXT is supported
        if (incomingMessage.type !== "text") {
            return;
        }

        const webhookContact =
            contacts.find(
                (contact) =>
                    contact.wa_id === phoneNumber,
            );

        const contactName =
            webhookContact?.profile?.name;

        const contact =
            await this.contactService.getOrCreateContact({
                organizationId:
                    account.organizationId,

                whatsappAccountId:
                    account.id,

                phoneNumber,

                name: contactName,
            });

        const conversation =
            await this.conversationService.getOrCreateConversation(
                account.organizationId,
                account.id,
                contact.id,
            );

        const messageTimestamp =
            incomingMessage.timestamp
                ? new Date(
                    Number(
                        incomingMessage.timestamp,
                    ) * 1000,
                )
                : new Date();

        const body =
            incomingMessage.text?.body ?? null;

        const message =
            await this.messageService.createIncomingMessage({
                conversationId: conversation.id,
                providerMessageId,
                body,
                messageTimestamp,
            });

        await this.conversationService.updateLastMessageAt(
            account.organizationId,
            account.id,
            conversation.id,
            messageTimestamp,
        );

        await this.incomingMessageHandler.handle({
            message,
            organizationId: account.organizationId,
            whatsappAccountId: account.id,
            contactId: contact.id,
            conversationId: conversation.id,
        });

        return message;
    }

    async processWebhookEvent(
        webhookEventId: string,
    ) : Promise<void> {
        const event = 
            await this.webhookEventService.getById(
                webhookEventId,
            );

        if (!event) {
            throw new Error(
                `Webhook event not found: ${webhookEventId}`,
            );
        }

        if (event.status === "PROCESSED") {
            return;
        }

        switch (event.eventType) {
            case WEBHOOK_EVENT_TYPES.INCOMING_MESSAGE:
                await this.processIncomingMessageEvent(
                    event,
                );
                break;

            case WEBHOOK_EVENT_TYPES.MESSAGE_STATUS:
                await this.processMessageStatusEvent(
                    event,
                );
                break;

            default:
                throw new Error(
                    `Unsupported webhook event type: ${event.eventType}`,
                );
        }
    }

    private async processIncomingMessageEvent(
        event: WebhookEvent,
    ): Promise<void> {
        const payload = event.payload as unknown as {
            incomingMessage: WhatsAppWebhookMessage;
            contacts: WhatsAppWebhookContact[];
        };

        const incomingMessage =
            payload.incomingMessage;

        const contacts =
            payload.contacts;

        const account =
            await this.whatsappAccountRepository.findById(
                event.whatsappAccountId!,
            );

        if (!account) {
            throw new Error(
                `WhatsApp account not found: ${event.whatsappAccountId}`,
            );
        }

        await this.processIncomingMessage(
            account,
            incomingMessage,
            contacts,
        );
    }

    private async processMessageStatusEvent(
        event: WebhookEvent,
    ): Promise<void> {
        const status =
            event.payload as WhatsAppWebhookStatus;

        const providerMessageId =
            status.id;

        const metaStatus =
            status.status;

        if (!providerMessageId || !metaStatus) {
            return;
        }

        await this.messageService.processStatusUpdate(
            providerMessageId,
            mapMetaStatusToMessageStatus(
                metaStatus,
            ),
        );
    }
}