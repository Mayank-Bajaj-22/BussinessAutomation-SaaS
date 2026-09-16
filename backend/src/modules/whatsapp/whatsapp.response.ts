import { WhatsAppAccountStatus } from "@prisma/client";

export interface ContactResponse {
    id: string;
    organizationId: string;
    whatsappAccountId: string;
    phoneNumber: string;
    name: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ContactListResponse {
    contacts: ContactResponse[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export interface WhatsAppAccountResponse {
    id: string;
    organizationId: string;
    businessId: string;
    wabaId: string;
    phoneNumberId: string;
    displayPhoneNumber: string;
    status: WhatsAppAccountStatus;
    createdAt: string;
    updatedAt: Date;
}