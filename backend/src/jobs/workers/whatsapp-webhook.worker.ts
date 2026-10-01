import { whatsappWebhookWorker } from "./webhook.worker.js";

console.log("WhatsApp Worker Worker started");

async function shutdown(
    signal: string,
) {
    console.log(
        `${signal} received. Shutting down worker...`,
    );

    await whatsappWebhookWorker.close();

    console.log(
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