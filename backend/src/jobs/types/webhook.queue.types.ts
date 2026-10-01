export const WHATSAPP_WEBHOOK_QUEUE_NAME =
    "whatsapp-webhook";

export const WHATSAPP_WEBHOOK_JOB_NAME =
    "process-webhook-event";

export interface ProcessWebhookEventJobData {
    webhookEventId: string;
}