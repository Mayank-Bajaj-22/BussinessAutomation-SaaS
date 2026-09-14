import { env } from "../../config/env.config.js";

export const WHATSAPP_API_VERSION = 
    env.WHATSAPP_API_VERSION;

export const WHATSAPP_GRAPH_API_BASE_URL =
    env.WHATSAPP_GRAPH_API_BASE_URL;

export const WHATSAPP_TEXT_MESSAGE_TYPE =
    "text";

export const WHATSAPP_MESSAGING_PRODUCT =
    "whatsapp";

export const WHATSAPP_RECIPIENT_TYPE =
    "individual";

export const WHATSAPP_WEBHOOK_VERIFY_TOKEN =
    env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;