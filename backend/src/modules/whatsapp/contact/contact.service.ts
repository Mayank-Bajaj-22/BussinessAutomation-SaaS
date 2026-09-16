import { Contact, WhatsAppAccountStatus } from "@prisma/client";
import { CreateContactData, IContactRepository, ListContactsData, UpdateContactData } from "./contact.repository.interface.js";
import { AppError } from "../../../common/errors/AppError.js";
import { IWhatsAppAccountRepository } from "../account/whatsapp-account.repository.interface.js";

export class ContactService {
    constructor(
        private readonly contactRepository : IContactRepository,
        private readonly whatsappAccountRepository: IWhatsAppAccountRepository,
    ) {}

    private async getAccountForOrganization(
        organizationId: string,
        whatsappAccountId: string,
    ) {
        const account =
            await this.whatsappAccountRepository.findById(
                whatsappAccountId,
            );

        if (!account) {
            throw new AppError(
                "WhatsApp account not found.",
                404,
            );
        }

        if (account.organizationId !== organizationId) {
            throw new AppError(
                "WhatsApp account does not belong to organization.",
                403,
            );
        }

        return account;
    }

    async getContact(
        organizationId: string,
        whatsappAccountId: string,
        contactId: string,
    ): Promise<Contact> {
        await this.getAccountForOrganization(
            organizationId,
            whatsappAccountId,
        );

        const contact =
            await this.contactRepository.findContactById(
                contactId,
            );
        
        if (!contact) {
            throw new AppError(
                "Contact not found.",
                404,
            );
        }
        
        if (
            contact.organizationId !== organizationId ||
            contact.whatsappAccountId !== whatsappAccountId
        ) {
            throw new AppError(
                "Contact does not belong to this WhatsApp account.",
                403,
            );
        }

        return contact;
    }
    async createContact(
        organizationId: string,
        whatsappAccountId: string,
        data: CreateContactData,
    ) : Promise<Contact> {
        const account =
            await this.getAccountForOrganization(
                organizationId,
                whatsappAccountId,
            );
        
        if (account.status === WhatsAppAccountStatus.DISCONNECTED) {
            throw new AppError(
                "Cannot create contact for a disconnected WhatsApp account.",
                400,
            );
        }
        
        const exisitingContact = 
            await this.contactRepository.findContactByPhoneNumber(
                whatsappAccountId,
                data.phoneNumber,
            );
    
        if (exisitingContact) {
            throw new AppError(
                "A contact with this phone number already exists.",
                409,
            );
        }
    
        try {
            return this.contactRepository.createContact({
                organizationId,
                whatsappAccountId,
                phoneNumber: data.phoneNumber,
                name: data.name,
            });
        } catch (error: any) {
            /*
                * Database-level protection.
                *
                * Even if two requests arrive at exactly
                * the same time, the Prisma unique constraint
                * protects us from duplicate contacts.
            */

            if (error?.code === "P2002") {
                throw new AppError(
                    "A contact with this phone number already exists.",
                    409,
                );
            } 
            
            throw error;
        }
    }

    async getOrCreateContact(
        data: CreateContactData,
    ) : Promise<Contact> {
        await this.getAccountForOrganization(
            data.organizationId,
            data.whatsappAccountId,
        );

        const exisitingContact = 
            await this.contactRepository.findContactByPhoneNumber(
                data.whatsappAccountId,
                data.phoneNumber,
            );
    
        if (exisitingContact) {
            if (data.name && data.name !== exisitingContact.name) {
                return this.contactRepository.updateContact(
                    exisitingContact.id,
                    {
                        name: data.name,
                    },
                );
            }
    
            return exisitingContact;
        }
    
        try {
            return await this.contactRepository.createContact(
                data,
            );
        } catch (error: any) {
            /*
                * Concurrent webhook requests can both execute
                * findContactByPhoneNumber() and both see null.
                *
                * Database UNIQUE constraint is the final protection.
            */

            if (error?.code === "P2002") {
                const contact = 
                    await this.contactRepository.findContactByPhoneNumber(
                        data.whatsappAccountId,
                        data.phoneNumber,
                    );
    
                if (contact) {
                    return contact;
                }
            }
    
            throw error;
        }
    }

    async updateContact(
        organizationId: string,
        whatsappAccountId: string,
        contactId: string,
        data: UpdateContactData,
    ) : Promise<Contact> {
        await this.getAccountForOrganization(
            organizationId,
            whatsappAccountId,
        );

        const contact = 
            await this.getContact(
                organizationId,
                whatsappAccountId,
                contactId,
            );
    
        /*
            * If phone number is being changed,
            * make sure another contact doesn't
            * already use it.
        */
    
        if (data.phoneNumber && data.phoneNumber !== contact.phoneNumber) {
            const exisitingAccount = 
                await this.contactRepository.findContactByPhoneNumber(
                    whatsappAccountId,
                    data.phoneNumber,
                );

            if (exisitingAccount && exisitingAccount.id !== contact.id) {
                throw new AppError(
                    "A contact with this phone number already exists.",
                    409,
                );
            }
        }

        try {
            return await this.contactRepository.updateContact(contact.id, data);
        } catch (error: any) {
            if (error?.code === "P2002") {
                throw new AppError(
                    "A contact with this phone number already exists.",
                    409,
                );
            }

            throw error;
        }
    }

    async listContacts(
        organizationId: string,
        whatsappAccountId: string,
        data: {
            page: number,
            limit: number,
            search?: string,
        },
    ) {
        await this.getAccountForOrganization(
            organizationId,
            whatsappAccountId,
        );
    
        return this.contactRepository.listContacts(
            data as ListContactsData,
        );
    }
    
    async deleteContact(
        organizationId: string,
        whatsappAccountId: string,
        contactId: string,
    ): Promise<Contact> {

        await this.getAccountForOrganization(
            organizationId,
            whatsappAccountId,
        );

        const contact =
            await this.getContact(
                organizationId,
                whatsappAccountId,
                contactId,
            );

        return this.contactRepository.deleteContact(
            contact.id,
        );
    }
}