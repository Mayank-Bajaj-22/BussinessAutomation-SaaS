import { Prisma, WebhookEventStatus } from "@prisma/client";
import { IWebhookEventRepository } from "./webhook-event.repository.interface.js";
import { AppError } from "../../../common/errors/AppError.js";

export interface RegisterWebhookEventInput {
    eventKey: string;
    eventType: string;
    whatsappAccountId?: string | null;
    payload: Prisma.InputJsonValue;
}

export class WebhookEventService {
    constructor(
        private readonly webhookEventRepository: IWebhookEventRepository,
    ) {}

    async registerEvent(
        input: RegisterWebhookEventInput,
    ) {
        const existing = 
            await this.webhookEventRepository.findByEventKey(
                input.eventKey,
            );

        if (existing) {
            return {
                event: existing,
                isDuplicate: existing.status === WebhookEventStatus.PROCESSED,
            }
        }

        /**
            * Create event.
            *
            * Unique DB constraint is the final
            * concurrency protection.
        */

        try {
            const event = 
                await this.webhookEventRepository.createEvent({
                    eventKey: input.eventKey,
                    eventType: input.eventType,
                    whatsappAccountId: input.whatsappAccountId ?? null,
                    payload: input.payload,
                });

            return {
                event,
                isDuplicate: false,
            };
        } catch (error) {
            /**
                * Two webhook requests may reach here
                * simultaneously.
                *
                * One creates the row.
                * The other receives P2002.
            */

            if (
                error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
            ) {
                const existing = 
                    await this.webhookEventRepository.findByEventKey(
                        input.eventKey,
                    );

                if (!existing) {
                    throw new AppError(
                        "Webhook event conflict could not be resolved",
                        500,
                    );
                }

                return {
                    event: existing,
                    isDuplicate: existing.status === WebhookEventStatus.PROCESSED,
                };
            }

            throw error;
        }
    }

    async markProcessingAttempt(
        eventId: string,
    ) {
        return this.webhookEventRepository.incrementAttempts(eventId);
    }

    async claimForProcessing(
        eventId: string,
    ) : Promise<boolean> {
        return this.webhookEventRepository.claimForProcessing(
            eventId,
        );
    }

    async markProcessed(
        eventId: string,
    ) : Promise<void> {
        await this.webhookEventRepository.markProcessed(
            eventId
        )
    }

    async getById(
        eventId: string,
    ) {
        return this.webhookEventRepository.findById(
            eventId,
        );
    }

    async markFailed(
        eventId: string,
        error: unknown,
    ) {
        const errorMessage = 
            error instanceof Error
                ? error.message
                : "Unknown webhook processing error";

        await this.webhookEventRepository.markFailed(
            eventId,
            errorMessage,
        );
    }
}