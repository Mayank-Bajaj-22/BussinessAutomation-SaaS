import { Conversation, ConversationStatus } from "@prisma/client";
import { CreateConversationData, IConversationRepository, UpdateConversationData } from "./conversation.repository.interface.js";
import { prisma } from "../../../lib/prisma.js";

export class ConversationRepository implements IConversationRepository {
    async createConversation(
        data: CreateConversationData,
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
}