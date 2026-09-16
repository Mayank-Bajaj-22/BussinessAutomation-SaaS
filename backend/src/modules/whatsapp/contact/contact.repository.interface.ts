import { Contact } from "@prisma/client";

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

export interface IContactRepository {
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
}