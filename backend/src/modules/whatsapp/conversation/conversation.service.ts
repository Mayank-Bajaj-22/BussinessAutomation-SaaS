import { Conversation, ConversationStatus } from "@prisma/client";
import { AppError } from "../../../common/errors/AppError.js";
import { IWhatsAppAccountRepository } from "../account/whatsapp-account.repository.interface.js";
import { IContactRepository } from "../contact/contact.repository.interface.js";
import { CreateConversationData, IConversationRepository, ListConversationsParams, UpdateConversationData } from "./conversation.repository.interface.js";

export class ConversationService {
    constructor(
        private readonly conversationRepository: IConversationRepository,
        private readonly whatsappAccountRepository: IWhatsAppAccountRepository,
        private readonly contactRepository: IContactRepository,
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
                "WhatsApp account does not belong to this organization.",
                403,
            );
        }

        return account;
    }

    private async getContactForAccount(
        organizationId: string,
        whatsappAccountId: string,
        contactId: string,
    ) {
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

        if (contact.organizationId !== organizationId) {
            throw new AppError(
                "Contact does not belong to this organization.",
                403,
            );
        }

        if (contact.whatsappAccountId !== whatsappAccountId) {
            throw new AppError(
                "Contact does not belong to this WhatsApp account.",
                403,
            );
        }

        return contact;
    }

    async getConversation(
        organizationId: string,
        whatsappAccountId: string,
        conversationId: string,
    ): Promise<Conversation> {
        await this.getAccountForOrganization(
            organizationId,
            whatsappAccountId,
        );

        const conversation = 
            await this.conversationRepository.findConversationById(
                conversationId,
            );

        if (!conversation) {
            throw new AppError(
                "COnversation not found.",
                404,
            );
        }

        if (conversation.organizationId !== organizationId) {
            throw new AppError(
                "Conversation does not belong to this organization.",
                403,
            );
        }

        if (conversation.whatsappAccountId !== whatsappAccountId) {
            throw new AppError(
                "Conversation does not belong to this Whatsapp Account.",
                403,
            );
        }

        return conversation;
    }

    async getOrCreateConversation(
        organizationId: string,
        whatsappAccountId: string,
        contactId: string,
    ): Promise<Conversation> {
        await this.getAccountForOrganization(
            organizationId,
            whatsappAccountId,
        );

        await this.getContactForAccount(
            organizationId,
            whatsappAccountId,
            contactId,
        );

        // First try to find an existing OPEN conversation.

        const existingConversation = 
            await this.conversationRepository.findOpenConversation(
                whatsappAccountId,
                contactId,
            );

        if (existingConversation) {
            return existingConversation;
        }

        /*
            * No open conversation exists.
            *
            * Creation itself is protected by the database
            * unique constraint / concurrency strategy.
            *
            * We will finalize the database-level protection
            * in Step 4.3.
        */

        /*
            * Race-condition protection:
            *
            * Two requests can reach this point simultaneously.
            *
            * PostgreSQL partial unique index is the final
            * protection against duplicate OPEN conversations.
        */

        try {
            return await this.conversationRepository.createConversation({
                organizationId,
                whatsappAccountId,
                contactId,
                status: ConversationStatus.OPEN,
                lastMessageAt: new Date(),
            });
        } catch (error: any) {
            /*
                * If another concurrent request created the
                * conversation between our SELECT and INSERT,
                * re-fetch it.
            */

            /*
                * Another concurrent request won the race.
                *
                * PostgreSQL throws P2002 because of:
                *
                * Conversation_one_open_per_contact
            */

            if (error?.code === "P2002") {
                const conversation = 
                    await this.conversationRepository.findOpenConversation(
                        whatsappAccountId,
                        contactId,
                    );

                if (conversation) {
                    return conversation;
                }
            }

            throw error;
        }
    }

    async createConversation(
        data: CreateConversationData,
    ): Promise<Conversation> {
        await this.getAccountForOrganization(
            data.organizationId,
            data.whatsappAccountId,
        );

        await this.getContactForAccount(
            data.organizationId,
            data.whatsappAccountId,
            data.contactId,
        );

        if (
            data.status === undefined ||
            data.status === ConversationStatus.OPEN
        ) {
            const existingConversation = 
                await this.conversationRepository.findOpenConversation(
                    data.whatsappAccountId,
                    data.contactId,
                );

            if (existingConversation) {
                throw new AppError(
                    "An open conversation already exists for this contact.",
                    409,
                );
            }
        }

        try {
            return await this.conversationRepository.createConversation({
                ...data,
                status: data.status ??
                    ConversationStatus.OPEN,
            });
        } catch (error: any) {
            if (error?.code === "P2002") {
                throw new AppError(
                    "An open conversation already exists for this contact.",
                    409,
                );
            }

            throw error;
        }
    }

    async listConversations(
        organizationId: string,
        whatsappAccountId: string,
        params: ListConversationsParams,
    ) {
        await this.getAccountForOrganization(
            organizationId,
            whatsappAccountId,
        );

        return this.conversationRepository.findConversationsByAccount(
            whatsappAccountId,
            params,
        );
    }

    async listContactConversations(
        organizationId: string,
        whatsappAccountId: string,
        contactId: string,
        params: ListConversationsParams,
    ) {
        await this.getAccountForOrganization(
            organizationId,
            whatsappAccountId,
        );

        await this.getContactForAccount(
            organizationId,
            whatsappAccountId,
            contactId,
        );

        return this.conversationRepository.findConversationsByContact(
            contactId,
            params,
        );
    }

    async updateConversation(
        organizationId: string,
        whatsappAccountId: string,
        conversationId: string,
        data: UpdateConversationData,
    ): Promise<Conversation> {
        const conversation = 
            await this.getConversation(
                organizationId,
                whatsappAccountId,
                conversationId,
            );

        if (
            data.status !== undefined &&
            !Object.values(
                ConversationStatus,
            ).includes(data.status)
        ) {
            throw new AppError(
                "Invalid conversation status.",
                400,
            );
        }

        return this.conversationRepository.updateConversation(
            conversation.id,
            data,
        );
    }

    async closeConversation(
        organizationId: string,
        whatsappAccountId: string,
        conversationId: string,
    ): Promise<Conversation> {
        const conversation = 
            await this.getConversation(
                organizationId,
                whatsappAccountId,
                conversationId,
            );

        if (conversation.status === ConversationStatus.CLOSED) {
            return conversation;
        }

        return this.conversationRepository.updateConversation(
            conversation.id,
            {
                status: ConversationStatus.CLOSED,
            },
        );
    }

    async reopenConversation(
        organizationId: string,
        whatsappAccountId: string,
        conversationId: string,
    ): Promise<Conversation> {
        const conversation =
            await this.getConversation(
                organizationId,
                whatsappAccountId,
                conversationId,
            );

        if (conversation.status === ConversationStatus.OPEN) {
            return conversation;
        }

        const existingOpenConversation =
            await this.conversationRepository.findOpenConversation(
                whatsappAccountId,
                conversation.contactId,
            );

        if (existingOpenConversation && existingOpenConversation.id !== conversation.id) {
            throw new AppError(
                "Another open conversation already exists for this contact.",
                409,
            );
        }

        try {
            return await this.conversationRepository.updateConversation(
                conversation.id,
                {
                    status: ConversationStatus.OPEN,
                    lastMessageAt: new Date(),
                },
            );
        } catch (error: any) {
            if (error?.code === "P2002") {
                throw new AppError(
                    "Another open conversation already exists for this contact.",
                    409,
                );
            }

            throw error;
        }
    }

    async updateLastMessageAt(
        organizationId: string,
        whatsappAccountId: string,
        conversationId: string,
        timestamp: Date = new Date(),
    ): Promise<Conversation> {
        const conversation =
            await this.getConversation(
                organizationId,
                whatsappAccountId,
                conversationId,
            );

        return this.conversationRepository.updateConversation(
            conversation.id,
            {
                lastMessageAt: timestamp,
            },
        );
    }
}