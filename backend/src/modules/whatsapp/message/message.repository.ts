import { Message, PrismaClient } from "@prisma/client";
import { CreateMessageData, IMessageRepository, UpdateMessageData } from "./message.repository.interface.js";

export class MessageRepository implements IMessageRepository {
    constructor(
        private readonly prisma: PrismaClient
    ) {}

    async createMessage(
        data: CreateMessageData
    ): Promise<Message> {
        const message = await this.prisma.message.create({
            data: {
                conversationId: data.conversationId,
                providerMessageId: data.providerMessageId ?? null,
                direction: data.direction,
                type: data.type ?? "TEXT",
                body: data.body ?? null,
                status: data.status,
                messageTimestamp: data.messageTimestamp,
            },
        });

        return message;
    }

    async findMessageById(
        id: string
    ): Promise<Message | null> {
        const message = await this.prisma.message.findUnique({
            where: {
                id,
            },
        });

        return message;
    }

    async findMessageByProviderId(
        providerMessageId: string
    ): Promise<Message | null> {
        const message = await this.prisma.message.findUnique({
            where: {
                providerMessageId,
            },
        });

        return message;
    }

    async updateMessage(
        id: string, 
        data: UpdateMessageData
    ): Promise<Message> {
        const message = await this.prisma.message.update({
            where: {
                id,
            },
            data: {
                ...(data.status !== undefined && {
                    status: data.status,
                }),

                ...(data.body !== undefined && {
                    body: data.body,
                }),
            },
        });

        return message;
    }
}