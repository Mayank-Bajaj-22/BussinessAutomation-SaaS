import { Contact, Conversation, ConversationStatus, Message, MessageStatus, WhatsAppAccount, WhatsAppAccountStatus } from "@prisma/client";
import { CreateContactData, CreateConversationData, CreateMessageData, CreateWhatsAppAccountData, IWhatsAppRepository, UpdateContactData, UpdateConversationData, UpdateWhatsAppAccountData } from "./whatsapp.repository.interface.js";
import { prisma } from "../../lib/prisma.js";

export class WhatsAppRepository implements IWhatsAppRepository {
    async createWhatsAppAccount(
        data: CreateWhatsAppAccountData
    ): Promise<WhatsAppAccount> {
        return prisma.whatsAppAccount.create({
            data: {
                organizationId: data.organizationId,
                businessId: data.businessId,
                wabaId: data.wabaId,
                phoneNumberId: data.phoneNumberId,
                displayPhoneNumber: data.displayPhoneNumber,
                accessTokenEncrypted: data.accessTokenEncrypted,
                status: data.status ?? WhatsAppAccountStatus.CONNECTING,
            },
        });
    }

    async findWhatsAppAccountById(
        id: string
    ): Promise<WhatsAppAccount | null> {
        return prisma.whatsAppAccount.findUnique({
            where: {
                id,
            },
        });
    }

    async findWhatsAppAccountByOrganizationId(
        organizationId: string
    ): Promise<WhatsAppAccount[]> {
        return prisma.whatsAppAccount.findMany({
            where: {
                organizationId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    async findWhatsAppAccountByPhoneNumberId(
        phoneNumberId: string
    ): Promise<WhatsAppAccount | null> {
        return prisma.whatsAppAccount.findUnique({
            where: {
                phoneNumberId,
            },
        });
    }

    async updateWhatsAppAccount(
        id: string, 
        data: UpdateWhatsAppAccountData
    ): Promise<WhatsAppAccount> {
        return prisma.whatsAppAccount.update({
            where: {
                id,
            },
            data,
        });
    }

    async createContact(
        data: CreateContactData
    ): Promise<Contact> {
        return prisma.contact.create({
            data: {
                organizationId: data.organizationId,
                whatsappAccountId: data.whatsappAccountId,
                phoneNumber: data.phoneNumber,
                name: data.name,
            },
        });
    }

    async findContactById(
        id: string
    ): Promise<Contact | null> {
        return prisma.contact.findUnique({
            where: {
                id,
            },
        });
    }

    async findContactByPhoneNumber(
        whatsappAccountId: string, 
        phoneNumber: string
    ): Promise<Contact | null> {
        return prisma.contact.findUnique({
            where: {
                whatsappAccountId_phoneNumber: {
                    whatsappAccountId,
                    phoneNumber,
                },
            },
        });
    }

    async updateContact(
        id: string, 
        data: UpdateContactData
    ): Promise<Contact> {
        return prisma.contact.update({
            where: {
                id,
            },
            data,
        });
    }

    async createConversation(
        data: CreateConversationData
    ): Promise<Conversation> {
        return prisma.conversation.create({
            data: {
                organizationId: data.organizationId,
                whatsappAccountId: data.whatsappAccountId,
                contactId: data.contactId,
                status: data.status ?? ConversationStatus.OPEN,
                lastMessageAt: data.lastMessageAt,
            },
        });
    }

    async findConversationById(
        id: string,
    ): Promise<Conversation | null> {
        return prisma.conversation.findUnique({
            where: {
                id,
            },
        });
    }

    async findOpenConversation(
        whatsappAccountId: string, 
        contactId: string
    ): Promise<Conversation | null> {
        return prisma.conversation.findFirst({
            where: {
                whatsappAccountId,
                contactId,
                status: ConversationStatus.OPEN,
            },
            orderBy: {
                lastMessageAt: "desc",
            },
        });
    }

    async updateConversation(
        id: string,
        data: UpdateConversationData,
    ): Promise<Conversation> {
        return prisma.conversation.update({
            where: {
                id,
            },
            data,
        });
    }

    async createMessage(
        data: CreateMessageData,
    ): Promise<Message> {
        return prisma.message.create({
            data: {
                conversationId: data.conversationId,
                providerMessageId: data.providerMessageId,
                direction: data.direction,
                type: data.type ?? "TEXT",
                body: data.body,
                status: data.status,
                messageTimestamp: data.messageTimestamp,
            },
        });
    }

    async findMessageByProviderId(
        providerMessageId: string,
    ) : Promise<Message | null> {
        return prisma.message.findUnique({
            where: {
                providerMessageId,
            },
        });
    }

    async updateMessageStatus(
        id: string, 
        status: MessageStatus
    ): Promise<Message> {
        return prisma.message.update({
            where: {
                id,
            },
            data: {
                status,
            },
        });
    }
}