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

    async claimForProcessing(
        eventId: string
    ): Promise<boolean> {
        const processingTimeout = new Date(
            Date.now() - 5 * 60 * 1000,
        );

        const result = 
            await this.prisma.webhookEvent.updateMany({
                where: {
                    id: eventId,
                    OR: [
                        {
                            status: {
                                in: ["RECEIVED", "FAILED"],
                            },
                        },
                        {
                            status: "PROCESSING",
                            processingStartedAt: {
                                lt: processingTimeout,
                            },
                        },
                    ],
                },
                data: {
                    status: "PROCESSING",
                    processingStartedAt: new Date(),
                    attempts: {
                        increment: 1,
                    },
                    lastError: null,
                    processedAt: null,
                },
            });

        return result.count === 1;
    }
    async markProcessed(
        eventId: string
    ): Promise<void> {
        await this.prisma.webhookEvent.update({
            where: {
                id: eventId,
            },
            data: {
                status: "PROCESSED",
                processedAt: new Date(),
                processingStartedAt: null,
                lastError: null,
            },
        });
    }

    async findById(
        id: string
    ): Promise<any | null> {
        return this.prisma.webhookEvent.findUnique({
            where: {
                id,
            },
        });
    }

    async markFailed(
        eventId: string, 
        error: string
    ): Promise<void> {
        await this.prisma.webhookEvent.update({
            where: {
                id: eventId,
            },
            data: {
                status: "FAILED",
                processingStartedAt: null,
                lastError: error.slice(0, 2000),
            },
        });
    }
}