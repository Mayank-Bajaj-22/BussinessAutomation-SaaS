import { PrismaClient } from "@prisma/client";
import { CreateWebhookEventData, IWebhookEventRepository, UpdateWebhookEventData } from "./webhook-event.repository.interface.js";

export class WebhookEventRepository implements IWebhookEventRepository {
    constructor(
        private readonly prisma: PrismaClient,
    ) {}

    async createEvent(
        data: CreateWebhookEventData
    ): Promise<any> {
        return this.prisma.webhookEvent.create({
            data: {
                eventKey: data.eventKey,
                eventType: data.eventType,
                whatsappAccountId: data.whatsappAccountId ?? null,
                payload: data.payload,
            },
        });
    }

    async findByEventKey(
        eventKey: string
    ): Promise<any | null> {
        return this.prisma.webhookEvent.findUnique({
            where: {
                eventKey,
            },
        });
    }

    async updateEvent(
        id: string, 
        data: UpdateWebhookEventData
    ): Promise<any> {
        return this.prisma.webhookEvent.update({
            where: {
                id,
            },
            data: {
                ...(data.status !== undefined && {
                    status: data.status,
                }),

                ...(data.attempts !== undefined && {
                    attempts: data.attempts,
                }),

                ...(data.lastError !== undefined && {
                    lastError: data.lastError,
                }),

                ...(data.processedAt !== undefined && {
                    processedAt: data.processedAt,
                }),
            },
        });
    }

    async incrementAttempts(
        id: string
    ): Promise<any> {
        return this.prisma.webhookEvent.update({
            where: {
                id,
            },
            data: {
                attempts: {
                    increment: 1,
                },
            },
        });
    }
}