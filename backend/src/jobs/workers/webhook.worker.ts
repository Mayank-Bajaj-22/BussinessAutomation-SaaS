import { redisConnection } from "../../config/redis.js";
import { Worker } from "bullmq";
import { webhookEventService, webhookService } from "../../modules/whatsapp/webhook/webhook.container.js";
import { ProcessWebhookEventJobData, WHATSAPP_WEBHOOK_QUEUE_NAME } from "../types/webhook.queue.types.js";

export const whatsappWebhookWorker = new Worker<ProcessWebhookEventJobData>(
    WHATSAPP_WEBHOOK_QUEUE_NAME,
    async (job) => {
        const { webhookEventId } = job.data;

        const claimed = await webhookEventService.claimForProcessing(
            webhookEventId,
        );

        if (!claimed) {
            return;
        }

        try {
            await webhookService.processWebhookEvent(
                webhookEventId,
            );

            await webhookEventService.markProcessed(
                webhookEventId,
            );
        } catch (error) {
            await webhookEventService.markFailed(
                webhookEventId,
                error,
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
    console.log(
        `Webhook job completed: ${job.id}`,
    );
});

whatsappWebhookWorker.on("failed", (job, error) => {
    console.error(
        `Webhook job faild: ${job?.id}`,
        error,
    );
});

whatsappWebhookWorker.on("error", (error) => {
    console.error(
        "WhatsApp webhook worker error:",
        error,
    );
});