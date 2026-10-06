import { redisConnection } from "../../config/redis.js";
import { Worker } from "bullmq";
import { webhookEventService, webhookService } from "../../modules/whatsapp/webhook/webhook.container.js";
import { ProcessWebhookEventJobData, WHATSAPP_WEBHOOK_QUEUE_NAME } from "../types/webhook.queue.types.js";
import { logger } from "../../config/logger.js";

export const whatsappWebhookWorker = new Worker<ProcessWebhookEventJobData>(
    WHATSAPP_WEBHOOK_QUEUE_NAME,
    async (job) => {
        const { webhookEventId } = job.data;

        logger.info(
            "Processing webhook event",
            {
                jobId: job.id,
                webhookEventId,
            },
        )

        const claimed = await webhookEventService.claimForProcessing(
            webhookEventId,
        );

        if (!claimed) {
            logger.info(
                "Webhook event could not be claimed",
                {
                    jobId: job.id,
                    webhookEventId,
                },
            );

            return;
        }

        try {
            await webhookService.processWebhookEvent(
                webhookEventId,
            );

            await webhookEventService.markProcessed(
                webhookEventId,
            );

            logger.info(
                "Webhook event processed successfully",
                {
                    jobId: job.id,
                    webhookEventId,
                },
            );
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : String(error);

            await webhookEventService.markFailed(
                webhookEventId,
                errorMessage,
            );

            logger.error(
                "Webhook event processing failed",
                {
                    jobId: job.id,
                    webhookEventId,
                    error: {
                        name: error instanceof Error ? error.name : "UnknownError",
                        message: errorMessage,
                        stack: error instanceof Error ? error.stack : undefined,
                    },
                },
            );

            throw error;
        }
    }, 
    {
        connection: redisConnection,
        concurrency: 10,
    },
);

whatsappWebhookWorker.on("completed", (job) => {
    logger.info(
        "Webhook job completed",
        {
            jobId: job.id,
        },
    );
});

whatsappWebhookWorker.on("failed", (job, error) => {
    logger.error(
        "Webhook job failed",
        {
            jobId: job?.id,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
            },
        },
    );
});

whatsappWebhookWorker.on("error", (error) => {
    logger.error(
        "WhatsApp webhook worker error",
        {
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
            },
        },
    );
});