import { AppError } from "../../../common/errors/AppError.js";
import { env } from "../../../config/env.config.js";
import { IWhatsAppAccountRepository } from "../account/whatsapp-account.repository.interface.js";
import { ContactService } from "../contact/contact.service.js";
import { ConversationService } from "../conversation/conversation.service.js";
import { MessageService } from "../message/message.service.js";
import { WEBHOOK_MODES } from "./webhook.constants.js";
import { WhatsAppWebhookPayload } from "./webhook.types.js";

export interface VerifyWebhookInput {
    mode?: string;
    verifyToken?: string;
    challenge?: string;
}

export interface ProcessWebhookInput {
    rawBody?: Buffer;
    signature?: string;
    challenge?: string;
}

export class WebhookService {
    constructor(
        private readonly whatsappAccountRepository: IWhatsAppAccountRepository,
        private readonly contactService: ContactService,
        private readonly conversationService: ConversationService,
        private readonly messageService: MessageService,
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

    // async processWebhook(
    //     input: ProcessWebhookInput,
    // ) {
    //     const isValidateSignature =
    //         verifyWhatsAppWebhookSignature(
    //             input.rawBody,
    //             input.signature,
    //         );

    //     if (!isValidateSignature) {
    //         throw new AppError(
    //             "Invalid WhatsApp webhook signature",
    //             401,
    //         );
    //     }

    //     if (input.payload.object !== "whatsapp_business_account") {
    //         throw new AppError(
    //             "Invalid WhatsApp webhook object",
    //             400,
    //         );
    //     }

    //     const entries = 
    //         input.payload.entry ?? [];

    //     for (const entry of entries) {
    //         await this.processEntry(entry);
    //     }

    //     return {
    //         processed: true,
    //     };
    // }

    // private async processEntry(
    //     entry: NonNullable<
    //         WhatsAppWebhookPayload["entry"]
    //     >[number],
    // ) {
    //     const changes = 
    //         entry.changes ?? [];

    //     for (const change of changes) {
    //         await this.processChange(change);
    //     }
    // }

    // private async processChange(
    //     change: NonNullable<
    //         WhatsAppWebhookPayload["entry"]
    //     >[number]["changes"][number],
    // ) {
    //     if (change.field !== "messages") {
    //         // statuses will be handled separately in step 4.8
    //         return;
    //     }

    //     const value =
    // }
}