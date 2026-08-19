import { Contact, Conversation, Message, MessageDirection, MessageStatus, MessageType, WhatsAppAccount, WhatsAppAccountStatus } from "@prisma/client";
import { CreateContactData, CreateConversationData, CreateWhatsAppAccountData, IWhatsAppRepository } from "./whatsapp.repository.interface.js";
import { AppError } from "../../common/errors/AppError.js";

export class WhatsAppService {
    constructor(
        private readonly whatsappRepository : IWhatsAppRepository,
    ) {}

    async connectAccount(
        data: CreateWhatsAppAccountData,
    ) : Promise<WhatsAppAccount> {
        const exisitingAccount =    
            await this.whatsappRepository.findWhatsAppAccountByPhoneNumberId(
                data.phoneNumberId,
            );

        if (exisitingAccount) {
            throw new AppError(
                "This WhatsApp phone number is already connected.",
                400,
            );
        }

        return this.whatsappRepository.createWhatsAppAccount({
            ...data,
            status: data.status ?? WhatsAppAccountStatus.ACTIVE
        });
    }

    async getAccount(
        organizationId: string,
        accountId: string,
    ) : Promise<WhatsAppAccount> {
        const account = 
            await this.whatsappRepository.findWhatsAppAccountById(
                accountId,
            );

        if (!account) {
            throw new AppError(
                "WhatsApp account not found.",
                404,
            );
        }

        if (account.organizationId !== organizationId) {
            throw new AppError(
                "WhatsApp account does not belong to organization.",
                403,
            );
        }

        return account;
    }

    async getOrganizationAccounts(
        organizationId: string,
    ) : Promise<WhatsAppAccount[]> {
        return this.whatsappRepository.findWhatsAppAccountByOrganizationId(
            organizationId,
        );
    }

    async disconnectAccount(
        organizationId: string,
        accountId: string,
    ) : Promise<WhatsAppAccount> {
        const account = 
            await this.getAccount(
                organizationId,
                accountId,
            );

        if (account.status === WhatsAppAccountStatus.DISCONNECTED) {
            return account;
        }

        return this.whatsappRepository.updateWhatsAppAccount(
            account.id,
            {
                status: WhatsAppAccountStatus.DISCONNECTED,
            },
        );
    }

    async getOrCreateContact(
        data: CreateContactData,
    ) : Promise<Contact> {
        const exisitingContact = 
            await this.whatsappRepository.findContactByPhoneNumber(
                data.whatsappAccountId,
                data.phoneNumber,
            );

        if (exisitingContact) {
            if (data.name && data.name !== exisitingContact.name)  {
                return this.whatsappRepository.updateContact(
                    exisitingContact.id,
                    {
                        name: data.name,
                    },
                );
            }

            return exisitingContact;
        }

        return this.whatsappRepository.createContact(data);
    }

    async getOrCreateConversation(
        data: CreateConversationData,
    ) : Promise<Conversation> {
        const existingConversation = 
            await this.whatsappRepository.findOpenConversation(
                data.whatsappAccountId,
                data.contactId,
            );

        if (existingConversation) {
            return existingConversation;
        }

        return this.whatsappRepository.createConversation({
            organizationId: data.organizationId,
            whatsappAccountId: data.whatsappAccountId,
            contactId: data.contactId,
            status: "OPEN",
            lastMessageAt: data.lastMessageAt,
        });
    }

    async createIncomingMessage(data: {
        organizationId: string;
        whatsappAccountId: string;
        contactPhoneNumber: string;
        contactName?: string;
        providerMessageId: string;
        body: string;
        messageTimestamp: Date;
    }
    ) : Promise<Message> {
        const existingMessage = 
            await this.whatsappRepository.findMessageByProviderId(
                data.providerMessageId,
            );

        if (existingMessage) {
            return existingMessage;
        }

        const contact = 
            await this.getOrCreateContact({
                organizationId: data.organizationId,
                whatsappAccountId: data.whatsappAccountId,
                phoneNumber: data.contactPhoneNumber,
                name: data.contactName,
            });

        const conversation = 
            await this.getOrCreateConversation({
                organizationId: data.organizationId,
                whatsappAccountId: data.whatsappAccountId,
                contactId: contact.id,
                lastMessageAt: data.messageTimestamp,
            });

        const message =
            await this.whatsappRepository.createMessage({
                conversationId: conversation.id,
                providerMessageId: data.providerMessageId,
                direction: MessageDirection.INBOUND,
                type: MessageType.TEXT,
                body: data.body,
                status: MessageStatus.RECEIVED,
                messageTimestamp: data.messageTimestamp,
            });

        await this.whatsappRepository.updateConversation(
            conversation.id,
            {
                lastMessageAt: data.messageTimestamp,
            },
        );

        return message;
    }

    async createOutgoingMessage(data: {
        organizationId: string;
        whatsappAccountId: string;
        contactId: string;
        body: string;
    }) : Promise<Message> {
        const conversation =
            await this.getOrCreateConversation({
                organizationId: data.organizationId,
                whatsappAccountId: data.whatsappAccountId,
                contactId: data.contactId,
                lastMessageAt: new Date(),
            });

        const now = new Date();

        const message =
            await this.whatsappRepository.createMessage({
                conversationId: conversation.id,
                direction: MessageDirection.OUTBOUND,
                type: MessageType.TEXT,
                body: data.body,
                status: MessageStatus.SENT,
                messageTimestamp: now,
            });

        await this.whatsappRepository.updateConversation(
            conversation.id,
            {
                lastMessageAt: now,
            },
        );

        return message;
    }

    async updateMessageStatus(
        organizationId: string,
        messageId: string,
        status: MessageStatus,
    ): Promise<Message> {
        const message =
            await this.whatsappRepository.findMessageByProviderId(
                messageId,
            );

        if (!message) {
            throw new AppError(
                "Message not found.",
                404,
            );
        }

        return this.whatsappRepository.updateMessageStatus(
            message.id,
            status,
        );
    }
}