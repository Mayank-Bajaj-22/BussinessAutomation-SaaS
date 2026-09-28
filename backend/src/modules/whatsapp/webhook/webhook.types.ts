export interface WhatsAppWebhookVerificationQuery {
    "hub.mode"?: string;
    "hub.verify_token"?: string;
    "hub.challenge"?: string;
}

export interface WhatsAppWebhookPayload {
    object?: string;
    entry?: WhatsAppWebhookEntry[];
}

export interface WhatsAppWebhookEntry {
    id?: string;
    changes?: WhatsAppWebhookChange[];
}

export interface WhatsAppWebhookChange {
    field?: string;
    value?: WhatsAppWebhookValue;
}

export interface WhatsAppWebhookValue {
    messaging_product?: string;
    metadata?: {
        display_phone_number?: string;
        phone_number_id?: string;
    };
    contacts?: WhatsAppWebhookContact[];
    messages?: WhatsAppWebhookMessage[];
    statuses?: WhatsAppWebhookStatus[];
}

export interface WhatsAppWebhookContact {
    profile?: {
        name?: string;
    };
    wa_id?: string;
}

export interface WhatsAppWebhookMessage {
    from?: string;
    id?: string;
    timestamp?: string;
    type?: string;
    text?: {
        body?: string;
    };
}

export interface WhatsAppWebhookStatus {
    id?: string;
    status?: string;
    timestamp?: string;
    recipient_id?: string;
}