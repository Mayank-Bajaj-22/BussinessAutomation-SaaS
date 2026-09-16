import { Contact, WhatsAppAccount } from "@prisma/client";
import { ContactResponse } from "./whatsapp.response.js";

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

export function mapContactToResponse(
    contact: Contact,
) : ContactResponse {
    return {
        id: contact.id,
        organizationId: contact.organizationId,
        whatsappAccountId: contact.whatsappAccountId,
        phoneNumber: contact.phoneNumber,
        name: contact.name,
        createdAt: contact.createdAt.toISOString(),
        updatedAt: contact.updatedAt.toISOString(),
    };
}

export function mapContactsToResponse(
    contacts: Contact[],
): ContactResponse[] {
    return contacts.map(
        mapContactToResponse,
    );
}

export function mapWhatsAppAccountToResponse(
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

export function mapWhatsAppAccountsToResponse(
    accounts: WhatsAppAccount[],
): WhatsAppAccountResponse[] {
    return accounts.map(
        mapWhatsAppAccountToResponse,
    );
}