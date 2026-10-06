/**
 * BullMQ Workers
 *
 * Importing these files automatically creates
 * and starts their respective workers.
 */

import { emailWorker } from "./workers/email.workers.js";
import { whatsappWebhookWorker } from "./workers/webhook.worker.js";

export {
    emailWorker,
    whatsappWebhookWorker,
};