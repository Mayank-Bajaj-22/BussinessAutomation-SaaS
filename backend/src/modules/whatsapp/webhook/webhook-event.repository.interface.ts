import { Prisma, WebhookEventStatus } from "@prisma/client";

export interface CreateWebhookEventData {
    eventKey: string;
    eventType: string;
    whatsappAccountId?: string | null;
    payload: Prisma.InputJsonValue;
}

export interface UpdateWebhookEventData {
    status?: WebhookEventStatus;
    attempts?: number;
    lastError?: string | null;
    processedAt?: Date | null;
}

export interface IWebhookEventRepository {
    createEvent(data: CreateWebhookEventData): Promise<any>;
    findByEventKey(eventKey: string): Promise<any | null>;
    updateEvent(id: string, data: UpdateWebhookEventData): Promise<any>;
    incrementAttempts(id: string): Promise<any>;
}