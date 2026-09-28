export const WEBHOOK_MODES = {
    SUBSCRIBE: "subscribe",
} as const;

export const WEBHOOK_EVENTS = {
    WHATSAPP: "whatsapp",
} as const;

export const WEBHOOK_EVENT_TYPES = {
    INCOMING_MESSAGE: "whatsapp.message.incoming",
    MESSAGE_STATUS: "whatsapp.message.status",
} as const;