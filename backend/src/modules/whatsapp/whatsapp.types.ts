export interface WhatsAppTextMessageRequest {
    phoneNumberId: string;
    accessToken: string;
    recipientPhoneNumber: string;
    body: string;
}

export interface WhatsAppMessageResponse {
    messagingProduct: string;
    contacts: Array<{
        input: string;
        waId: string;
    }>;
    messages: Array<{
        id: string;
    }>;
}

export interface WhatsAppApiErrorResponse {
    error?: {
        message?: string;
        type?: string;
        code?: string;
        errorSubcode?: string;
        fbtraceId?: string;
    }
}