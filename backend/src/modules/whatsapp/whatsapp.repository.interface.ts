import { Contact, Conversation, ConversationStatus, Message, MessageDirection, MessageStatus, MessageType, WhatsAppAccount, WhatsAppAccountStatus } from "@prisma/client";

// message

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

// contact

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

export interface ListContactsData {
    organizationId: string;
    whatsappAccountId: string;
    page: number;
    limit: number;
    search?: string;
}

export interface ListContactsResult {
    contacts: Contact[];
    total: number;
}

// conversation

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

    // message

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

    // contact

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

    listContacts(
        data: ListContactsData,
    ) : Promise<ListContactsResult>;

    updateContact(
        id: string,
        data: UpdateContactData,
    ) : Promise<Contact>;

    deleteContact(
        id: string,
    ) : Promise<Contact>;

    // conversation

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

    // message

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

    findMessageById(
        id: string,
    ) : Promise<Message | null>;
}