import { WhatsAppAccount } from "@prisma/client";

export interface WhatsAppAccountResponse {
    id: string;
    organizationId: string;
    businessId: string;
    wabaId: string;
    phoneNumberId: string;
    displayPhoneNumber: string;
    status: WhatsAppAccount["status"];
    createdAt: Date;
    updatedAt: Date;
}

export function toWhatsAppAccountResponse(
    account: WhatsAppAccount,
) : WhatsAppAccountResponse {
    return {
        id: account.id,
        organizationId: account.organizationId,
        businessId: account.businessId,
        wabaId: account.wabaId,
        phoneNumberId: account.phoneNumberId,
        displayPhoneNumber: account.displayPhoneNumber,
        status: account.status,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
    };
}
