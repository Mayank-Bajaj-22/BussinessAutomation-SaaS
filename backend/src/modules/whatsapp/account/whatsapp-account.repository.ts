import { WhatsAppAccount } from "@prisma/client";
import { IWhatsAppAccountRepository } from "./whatsapp-account.repository.interface.js";
import { prisma } from "../../../lib/prisma.js";

export class WhatsAppAccountRepository implements IWhatsAppAccountRepository {
    async findById(
        id: string,
    ): Promise<WhatsAppAccount | null> {

        return prisma.whatsAppAccount.findUnique({
            where: {
                id,
            },
        });
    }

    async findByPhoneNumberId(
        phoneNumberId: string,
    ): Promise<WhatsAppAccount | null> {

        return prisma.whatsAppAccount.findUnique({
            where: {
                phoneNumberId,
            },
        });
    }
}