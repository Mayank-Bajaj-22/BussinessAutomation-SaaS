import { WhatsAppAccount } from "@prisma/client";

export interface IWhatsAppAccountRepository {
    findById(
        id: string,
    ): Promise<WhatsAppAccount | null>;

    findByPhoneNumberId(
        phoneNumberId: string,
    ): Promise<WhatsAppAccount | null>;
}