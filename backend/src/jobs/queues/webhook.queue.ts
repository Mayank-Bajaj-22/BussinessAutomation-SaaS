import { Queue } from "bullmq";
import { ProcessWebhookEventJobData, WHATSAPP_WEBHOOK_JOB_NAME, WHATSAPP_WEBHOOK_QUEUE_NAME } from "../types/webhook.queue.types.js";
import { redisConnection } from "../../config/redis.js";

export const whatsappWebhookQueue = new Queue<ProcessWebhookEventJobData>(
    WHATSAPP_WEBHOOK_QUEUE_NAME,
    {
        connection: redisConnection,
        defaultJobOptions: {
            attempts: 5, 
            backoff: {
                type: "exponential",
                delay: 2000,
            },
            removeOnComplete: {
                age: 60 * 60,
                count: 1000,
            },
            removeOnFail: {
                age: 24 * 60 * 60,
                count: 5000,
            },
        },
    },
);

export async function enqueueWebhookEvent(
    webhookEventId: string,
) {
    return whatsappWebhookQueue.add(
        WHATSAPP_WEBHOOK_JOB_NAME,
        {
            webhookEventId,
        },
        {
            jobId: `webhook-event-${webhookEventId}`,
        },
    );
}