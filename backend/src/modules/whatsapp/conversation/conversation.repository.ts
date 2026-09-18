import { Conversation, ConversationStatus, Prisma } from "@prisma/client";
import { CreateConversationData, IConversationRepository, ListConversationsParams, UpdateConversationData } from "./conversation.repository.interface.js";
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
            orderBy: [
                {
                    lastMessageAt: "desc",
                },
                {
                    createdAt: "desc",
                }
            ],
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

    async findConversationsByAccount(
        whatsappAccountId: string, 
        params: ListConversationsParams
    ): Promise<{ conversations: Conversation[]; total: number; }> {
        const page = Math.max(params.page, 1);

        const limit = Math.min(
            Math.max(params.limit, 1),
            100,
        );

        const skip = ( page - 1 ) * limit;

        const where: 
            Prisma.ConversationWhereInput = {
                whatsappAccountId,
                ...(params.status
                    ? {
                        status: params.status,
                    }
                    : {}
                ),
            };

        const [conversations, total] = 
            await prisma.$transaction([
                prisma.conversation.findMany({
                    where,
                    orderBy: [
                        {
                            lastMessageAt: "desc",
                        },
                        {
                            createdAt: "desc",
                        },
                    ],
                    skip,
                    take: limit,
                }),

                prisma.conversation.count({
                    where,
                }),
            ]);

        return {
            conversations,
            total,
        }
    }

    async findConversationsByContact(
        contactId: string, 
        params: ListConversationsParams
    ): Promise<{ conversations: Conversation[]; total: number; }> {
        const page = Math.max(params.page, 1);

        const limit = Math.min(
            Math.max(params.limit, 1),
            100,
        );

        const skip = ( page - 1 ) * limit;

        const where: Prisma.ConversationWhereInput = {
            contactId,
            ...(params.status
                ? {
                    status: params.status,
                }
                : {}
            ),
        };

        const [conversations, total] = 
            await prisma.$transaction([
                prisma.conversation.findMany({
                    where,
                    orderBy: [
                        {
                            lastMessageAt: "desc",
                        },
                        {
                            createdAt: "desc",
                        },
                    ],
                    skip,
                    take: limit,
                }),

                prisma.conversation.count({
                    where,
                }),
            ]);

        return {
            conversations,
            total,
        };
    }
}