import { AppError } from "../../../common/errors/AppError.js";
import { env } from "../../../config/env.config.js";
import { IWhatsAppAccountRepository } from "../account/whatsapp-account.repository.interface.js";
import { ContactService } from "../contact/contact.service.js";
import { ConversationService } from "../conversation/conversation.service.js";
import { MessageService } from "../message/message.service.js";
import { WebhookEventService } from "./webhook-event.service.js";
import { WEBHOOK_MODES } from "./webhook.constants.js";
import { verifyWhatsAppWebhookSignature } from "./webhook.crypto.js";
import { WhatsAppWebhookChange, WhatsAppWebhookContact, WhatsAppWebhookMessage, WhatsAppWebhookPayload } from "./webhook.types.js";

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
            await this.processEntry(entry);
        }

        return {
            processed: true,
        };
    }

    private async processEntry(
        entry: NonNullable<
            WhatsAppWebhookPayload["entry"]
        >[number],
    ) {
        const changes = 
            entry.changes ?? [];

        for (const change of changes) {
            await this.processChange(change);
        }
    }

    private async processChange(
        change: WhatsAppWebhookChange,
    ): Promise<void> {
        if (change.field !== "messages") {
            // statuses will be handled separately in step 4.8
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

        const messages = value.messages ?? [];

        const contacts = value.contacts ?? [];

        for (const incomingMessage of messages) {
            await this.processIncomingMessage(
                account,
                incomingMessage,
                contacts,
            );
        }
    }

    private async processIncomingMessage(
        account: any,
        incomingMessage: WhatsAppWebhookMessage,
        contacts: WhatsAppWebhookContact[],
    ) {
        const providerMessageId = incomingMessage.id;

        const phoneNumber = incomingMessage.from;

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

        // 1. IDEMPOTENCY CHECK - meta can retry the same webhook

        const exisitngMessage = 
            await this.messageService.findMessageProviderId(
                providerMessageId,
            );

        if (exisitngMessage) {
            return;
        }

        // 2. Find sender profile name

        const webhookContact =
            contacts.find(
                (contact) =>
                contact.wa_id === phoneNumber,
            );

        const contactName =
            webhookContact?.profile?.name;

        // 3. Get/Create contact

        const contact = 
            await this.contactService.getOrCreateContact({
                organizationId: account.organizationId,
                whatsappAccountId: account.id,
                phoneNumber,
                name: contactName,
            });

        // 4. Get/Create conversation

        const conversation =
            await this.conversationService.getOrCreateConversation(
                account.organizationId,
                account.id,
                contact.id,
            );

        // 5. Parse message

        const messageTimestamp = 
            incomingMessage.timestamp 
            ? new Date(
                Number(
                    incomingMessage.timestamp,
                ) * 1000,
            )
            : new Date();

        let body: string | null = null;

        if (incomingMessage.type === "text") {
            body = incomingMessage.text?.body ?? null;
        }

        if (incomingMessage.type !== "text") {
            return;
        }

        // 6. Create inbound message

        const message =
            await this.messageService.createIncomingMessage({
                conversationId: conversation.id,
                providerMessageId,
                body,
                messageTimestamp,
            });

        // 7. Update conversation activity

        await this.conversationService.updateLastMessageAt(
            account.organizationId,
            account.id,
            conversation.id,
            messageTimestamp,
        );

        return message;
    }
}