import { logger } from "../../config/logger.js";
import { whatsappWebhookWorker } from "./webhook.worker.js";

logger.info(
    "WhatsApp Webhook Worker started",
);

async function shutdown(
    signal: string,
) {
    logger.info(
        "WhatsApp Webhook Worker shutting down",
        {
            signal,
        },
    );

    await whatsappWebhookWorker.close();

    logger.info(
        "WhatsApp Webhook Worker stopped",
    );

    process.exit(0);
}

process.on(
    "SIGTERM",
    () => shutdown("SIGTERM"),
);

process.on(
    "SIGINT",
    () => shutdown("SIGINT"),
);