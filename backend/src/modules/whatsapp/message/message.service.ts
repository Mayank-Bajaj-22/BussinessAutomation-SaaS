import { MessageDirection, MessageStatus, MessageType } from "@prisma/client";
import { AppError } from "../../../common/errors/AppError.js";
import { IWhatsAppAccountRepository } from "../account/whatsapp-account.repository.interface.js";
import { ContactService } from "../contact/contact.service.js";
import { ConversationService } from "../conversation/conversation.service.js";
import { IWhatsAppClient } from "../whatsapp.client.interface.js";
import { decryptWhatsAppToken } from "../whatsapp.crypto.js";
import { CreateMessageData, IMessageRepository } from "./message.repository.interface.js";

export interface SendMessageInput {
    organizationId: string;
    whatsappAccountId: string;
    contactId: string;
    body: string;
}

export class MessageService {
    constructor(
        private readonly messageRepository: IMessageRepository,
        private readonly whatsappAccountRepository: IWhatsAppAccountRepository,
        private readonly contactService: ContactService,
        private readonly conversationService: ConversationService,
        private readonly whatsappClient: IWhatsAppClient,
    ) {}

    async sendTextMessage(
        input: SendMessageInput,
    ) {
        const account = 
            await this.whatsappAccountRepository.findById(
                input.whatsappAccountId,
            );

        if (!account) {
            throw new AppError(
                "WhatsApp account not found",
                404,
            );
        }

        if (account.organizationId !== input.organizationId) {
            throw new AppError(
                "You do not have access to this WhatsApp account",
                403,
            );
        }

        if (account.status !== "ACTIVE") {
            throw new AppError(
                "WhatsApp account is not active",
                409,
            );
        }

        const contact = await this.contactService.getContact(
            input.organizationId,
            input.whatsappAccountId,
            input.contactId,
        );

        const conversation = 
            await this.conversationService.getOrCreateConversation(
                input.organizationId,
                input.whatsappAccountId,
                contact.id,
            );

        const accessToken = decryptWhatsAppToken(
            account.accessTokenEncrypted,
        );

        const whatsappResponse = await this.whatsappClient.sendTextMessage({
            phoneNumberId: account.phoneNumberId,
            accessToken,
            recipientPhoneNumber: contact.phoneNumber,
            body: input.body,
        });

        if (!whatsappResponse.messages || whatsappResponse.messages.length === 0) {
            throw new AppError(
                "WhatsApp provider did not return a message ID",
                502,
            );
        }

        const providerMessageId = whatsappResponse.messages[0].id;

        const messageData: CreateMessageData = {
            conversationId: conversation.id,
            providerMessageId,
            direction: MessageDirection.OUTBOUND,
            type: MessageType.TEXT,
            body: input.body,
            status: MessageStatus.SENT,
            messageTimestamp: new Date(),
        };

        const message = 
            await this.messageRepository.createMessage(
                messageData,
            );

        await this.conversationService.updateLastMessageAt(
            input.organizationId,
            input.whatsappAccountId,
            conversation.id,
            message.messageTimestamp,
        );

        return message;
    }

    async getMessage(
        organizationId: string,
        accountId: string,
        messageId: string,
    ) {
        const account = 
            await this.whatsappAccountRepository.findById(
                accountId,
            );

        if (!account) {
            throw new AppError(
                "WhatsApp account not found",
                404,
            );
        }

        if (account.organizationId !== organizationId) {
            throw new AppError(
                "You do not have access to this WhatsApp account",
                403,
            );
        }

        const message =
            await this.messageRepository.findMessageById(
                messageId,
            );

        if (!message) {
            throw new AppError(
                "Message not found",
                404,
            );
        }

        const conversation = 
            await this.conversationService.getConversation(
                organizationId,
                accountId,
                message.conversationId,
            );

        if (!conversation) {
            throw new AppError(
                "Message does not belong to this WhatsApp account",
                403,
            );
        }

        return message;
    }
}