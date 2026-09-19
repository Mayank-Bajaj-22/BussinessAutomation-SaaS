import { WhatsAppAccount, WhatsAppAccountStatus } from "@prisma/client";
import { CreateWhatsAppAccountData, IWhatsAppRepository, UpdateWhatsAppAccountData } from "./whatsapp.repository.interface.js";
import { AppError } from "../../common/errors/AppError.js";
import { IWhatsAppClient } from "./whatsapp.client.interface.js";
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
}