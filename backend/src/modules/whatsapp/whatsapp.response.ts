import { WhatsAppAccountStatus } from "@prisma/client";

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