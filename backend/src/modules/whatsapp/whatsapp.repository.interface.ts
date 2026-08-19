import { Contact, Conversation, ConversationStatus, Message, MessageDirection, MessageStatus, MessageType, WhatsAppAccount, WhatsAppAccountStatus } from "@prisma/client";

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

export interface CreateContactData {
    organizationId: string;
    whatsappAccountId: string;
    phoneNumber: string;
    name?: string;
}

export interface UpdateContactData {
    name?: string;
    phoneNumber?: string;
}

export interface CreateConversationData {
    organizationId: string;
    whatsappAccountId: string;
    contactId: string;
    status?: ConversationStatus;
    lastMessageAt?: Date;
}

export interface UpdateConversationData {
    status?: ConversationStatus;
    lastMessageAt?: Date;
}

export interface CreateMessageData {
    conversationId: string;
    providerMessageId?: string;
    direction: MessageDirection;
    type?: MessageType;
    body?: string;
    status: MessageStatus;
    messageTimestamp: Date;
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

    createContact(
        data: CreateContactData,
    ) : Promise<Contact>;

    findContactById(
        id: string,
    ) : Promise<Contact | null>;

    findContactByPhoneNumber(
        whatsappAccountId: string,
        phoneNumber: string,
    ) : Promise<Contact | null>;

    updateContact(
        id: string,
        data: UpdateContactData,
    ) : Promise<Contact>;

    createConversation(
        data: CreateConversationData,
    ) : Promise<Conversation>;

    findConversationById(
        id: string,
    ) : Promise<Conversation | null>;

    findOpenConversation(
        whatsappAccountId: string,
        contactId: string,
    ) : Promise<Conversation | null>;

    updateConversation(
        id: string,
        data: UpdateConversationData,
    ): Promise<Conversation>;

    createMessage(
        data: CreateMessageData,
    ) : Promise<Message>;

    findMessageByProviderId(
        providerMessageId: string,
    ) : Promise<Message | null>;

    updateMessageStatus(
        id: string,
        status: MessageStatus,
    ) : Promise<Message>;
}