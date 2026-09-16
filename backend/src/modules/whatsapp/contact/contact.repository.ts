import { Contact } from "@prisma/client";
import { CreateContactData, IContactRepository, ListContactsData, ListContactsResult, UpdateContactData } from "./contact.repository.interface.js";
import { prisma } from "../../../lib/prisma.js";

export class ContactRepository implements IContactRepository {
    async createContact(
        data: CreateContactData
    ): Promise<Contact> {
        return prisma.contact.create({
            data: {
                organizationId: data.organizationId,
                whatsappAccountId: data.whatsappAccountId,
                phoneNumber: data.phoneNumber,
                name: data.name,
            },
        });
    }

    async findContactById(
        id: string
    ): Promise<Contact | null> {
        return prisma.contact.findUnique({
            where: {
                id,
            },
        });
    }

    async findContactByPhoneNumber(
        whatsappAccountId: string, 
        phoneNumber: string
    ): Promise<Contact | null> {
        return prisma.contact.findUnique({
            where: {
                whatsappAccountId_phoneNumber: {
                    whatsappAccountId,
                    phoneNumber,
                },
            },
        });
    }

    async listContacts(
        data: ListContactsData
    ): Promise<ListContactsResult> {
        const { organizationId, whatsappAccountId, page, limit, search } = data;

        const skip = (page - 1) * limit;

        const where = {
            organizationId,
            whatsappAccountId,
            ...(search
                ? {
                    OR: [
                        {
                            name: {
                                contains: search,
                                mode: 'insensitive' as const,
                            },
                        },
                        {
                            phoneNumber: {
                                contains: search,
                                mode: 'insensitive' as const,
                            },
                        },
                    ],
                }
                : {}),
        };

        const [contacts, total] = await prisma.$transaction([
            prisma.contact.findMany({
                where,
                orderBy: {
                    createdAt: "desc",
                },
                skip,
                take: limit,
            }),

            prisma.contact.count({
                where,
            }),
        ]);

        return {
            contacts,
            total,
        };
    }

    async updateContact(
        id: string, 
        data: UpdateContactData
    ): Promise<Contact> {
        return prisma.contact.update({
            where: {
                id,
            },
            data,
        });
    }

    async deleteContact(
        id: string,
    ): Promise<Contact> {

        return prisma.contact.delete({
            where: {
                id,
            },
        });
    }
}