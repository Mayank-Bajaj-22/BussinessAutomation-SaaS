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

export interface WhatsAppOAuthState {
    organizationId: string;
    userId: string;
    nonce: string;
    createdAt: string;
}

export interface WhatsAppOAuthTokenResponse {
    access_token: string;
    token_type?: string;
    expires_in?: number;
}