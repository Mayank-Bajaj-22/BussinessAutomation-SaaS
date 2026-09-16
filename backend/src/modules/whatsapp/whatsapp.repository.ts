import { Message, MessageStatus, WhatsAppAccount, WhatsAppAccountStatus } from "@prisma/client";
import { CreateMessageData, CreateWhatsAppAccountData, IWhatsAppRepository, UpdateWhatsAppAccountData } from "./whatsapp.repository.interface.js";
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

    async findMessageById(
        id: string
    ): Promise<Message | null> {
        return prisma.message.findUnique({
            where: {
                id,
            },
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