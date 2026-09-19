import { Message, MessageDirection, MessageStatus, MessageType, WhatsAppAccount, WhatsAppAccountStatus } from "@prisma/client";

export interface CreateWhatsAppAccountData {
    organizationId: string;
    businessId: string;
    wabaId: string;
    phoneNumberId: string;
    displayPhoneNumber: string;
    accessTokenEncrypted: string;
    status?: WhatsAppAccountStatus;
}

export interface UpdateWhatsAppAccountData {
    businessId?: string;
    wabaId?: string;
    phoneNumberId?: string;
    displayPhoneNumber?: string;
    accessTokenEncrypted?: string;
    status?: WhatsAppAccountStatus;
}

export interface IWhatsAppRepository {
    createWhatsAppAccount(
        data: CreateWhatsAppAccountData,
    ) : Promise<WhatsAppAccount>;

    findWhatsAppAccountById(
        id: string,
    ) : Promise<WhatsAppAccount | null>;

    findWhatsAppAccountByOrganizationId(
        organizationId: string,
    ) : Promise<WhatsAppAccount[]>;

    findWhatsAppAccountByPhoneNumberId(
        phoneNumberId: string,
    ) : Promise<WhatsAppAccount | null>;

    updateWhatsAppAccount(
        id: string,
        data: UpdateWhatsAppAccountData,
    ) : Promise<WhatsAppAccount>;
}