import { Message, MessageStatus, WhatsAppAccount, WhatsAppAccountStatus } from "@prisma/client";
import { CreateWhatsAppAccountData, IWhatsAppRepository, UpdateWhatsAppAccountData } from "./whatsapp.repository.interface.js";
import { AppError } from "../../common/errors/AppError.js";
import { IWhatsAppClient } from "./whatsapp.client.interface.js";
import { decryptWhatsAppToken } from "./whatsapp.crypto.js";
import { ContactService } from "./contact/contact.service.js";

export class WhatsAppService {
    constructor(
        private readonly whatsappRepository : IWhatsAppRepository,
        private readonly whatsappClient : IWhatsAppClient,
        private readonly contactService : ContactService,
    ) {}

    async connectAccount(
        data: CreateWhatsAppAccountData,
    ) : Promise<WhatsAppAccount> {
        const exisitingAccount =    
            await this.whatsappRepository.findWhatsAppAccountByPhoneNumberId(
                data.phoneNumberId,
            );

        if (exisitingAccount) {
            throw new AppError(
                "This WhatsApp phone number is already connected.",
                400,
            );
        }

        return this.whatsappRepository.createWhatsAppAccount({
            ...data,
            status: data.status ?? WhatsAppAccountStatus.ACTIVE
        });
    }

    async getAccount(
        organizationId: string,
        accountId: string,
    ) : Promise<WhatsAppAccount> {
        const account = 
            await this.whatsappRepository.findWhatsAppAccountById(
                accountId,
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

    async getOrganizationAccounts(
        organizationId: string,
    ) : Promise<WhatsAppAccount[]> {
        return this.whatsappRepository.findWhatsAppAccountByOrganizationId(
            organizationId,
        );
    }

    async disconnectAccount(
        organizationId: string,
        accountId: string,
    ) : Promise<WhatsAppAccount> {
        const account = 
            await this.getAccount(
                organizationId,
                accountId,
            );

        if (account.status === WhatsAppAccountStatus.DISCONNECTED) {
            return account;
        }

        return this.whatsappRepository.updateWhatsAppAccount(
            account.id,
            {
                status: WhatsAppAccountStatus.DISCONNECTED,
            },
        );
    }

    async updateAccount(
        organizationId: string,
        accountId: string,
        data: UpdateWhatsAppAccountData,
    ) : Promise<WhatsAppAccount> {
        const account = 
            await this.getAccount(
                organizationId,
                accountId,
            );
        
        if (account.status === WhatsAppAccountStatus.DISCONNECTED) {
            throw new AppError(
                "Disconnected WhatsApp account cannot be updated.",
                400,
            );
        }

        if (data.phoneNumberId && data.phoneNumberId !== account.phoneNumberId) {
            const existingAccount = 
                await this.whatsappRepository.findWhatsAppAccountByPhoneNumberId(
                    data.phoneNumberId,
                );

            if (existingAccount && existingAccount.id !== account.id) {
                throw new AppError(
                    "This WhatsApp phone number is already connected to another account.",
                    409,
                );
            }
        }

        return this.whatsappRepository.updateWhatsAppAccount(
            account.id,
            data,
        );
    }

    async createIncomingMessage(data: {
        organizationId: string;
        whatsappAccountId: string;
        contactPhoneNumber: string;
        contactName?: string;
        providerMessageId: string;
        body: string;
        messageTimestamp: Date;
    }
    ) : Promise<Message> {
        const existingMessage = 
            await this.whatsappRepository.findMessageByProviderId(
                data.providerMessageId,
            );

        if (existingMessage) {
            return existingMessage;
        }

        const contact = 
            await this.contactService.getOrCreateContact({
                organizationId: data.organizationId,
                whatsappAccountId: data.whatsappAccountId,
                phoneNumber: data.contactPhoneNumber,
                name: data.contactName,
            });

        /*
            * Conversation will be handled by
            * ConversationService in Step 4.
            *
            * TEMPORARILY this part stays out of this
            * Contact separation refactor.
        */

        throw new AppError(
            "ConversationService must be wired before processing incoming messages.",
            500,
        );
    }

    async sendTextMessage(data: {
        organizationId: string;
        whatsappAccountId: string;
        contactId: string;
        body: string;
    }): Promise<Message> {

        const body = data.body.trim();

        if (!body) {
            throw new AppError(
                "Message body cannot be empty.",
                400,
            );
        }

        // Account ownership
        const account =
            await this.getAccount(
                data.organizationId,
                data.whatsappAccountId,
            );

        if (
            account.status ===
            WhatsAppAccountStatus.DISCONNECTED
        ) {
            throw new AppError(
                "WhatsApp account is disconnected.",
                400,
            );
        }

        // Contact ownership
        const contact =
            await this.contactService.getContact(
                data.organizationId,
                data.whatsappAccountId,
                data.contactId,
            );

        // Decrypt Meta token
        const accessToken =
            decryptWhatsAppToken(
                account.accessTokenEncrypted,
            );

        // Send to Meta
        const metaResponse =
            await this.whatsappClient.sendTextMessage({
                phoneNumberId:
                    account.phoneNumberId,

                accessToken,

                recipientPhoneNumber:
                    contact.phoneNumber,

                body,
            });

        const providerMessageId =
            metaResponse.messages?.[0]?.id;

        if (!providerMessageId) {
            throw new AppError(
                "WhatsApp message ID was not returned by Meta.",
                502,
            );
        }

        /*
            * ConversationService will own:
            *
            * getOrCreateConversation()
            *
            * and MessageService will eventually own
            * message persistence.
            *
            * We will wire this properly in Step 4.
        */

        throw new AppError(
            "ConversationService must be wired before storing outgoing messages.",
            500,
        );
    }

    async updateMessageStatus(
        organizationId: string,
        messageId: string,
        status: MessageStatus,
    ): Promise<Message> {

        const message =
            await this.whatsappRepository
                .findMessageByProviderId(
                    messageId,
                );

        if (!message) {
            throw new AppError(
                "Message not found.",
                404,
            );
        }

        return this.whatsappRepository.updateMessageStatus(
            message.id,
            status,
        );
    }
}