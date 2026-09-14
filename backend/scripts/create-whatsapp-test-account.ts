import { encryptWhatsAppToken } from "../src/modules/whatsapp/whatsapp.crypto.js";
import { prisma } from "../src/lib/prisma.js";
import dotenv from 'dotenv';
dotenv.config()

const organizationId =
    process.env.TEST_ORGANIZATION_ID!;

const phoneNumberId =
    process.env.TEST_WHATSAPP_PHONE_NUMBER_ID!;

const accessToken =
    process.env.TEST_WHATSAPP_ACCESS_TOKEN!;

const businessId =
    process.env.TEST_META_BUSINESS_ID ?? "dev-business";

const wabaId =
    process.env.TEST_WABA_ID ?? "dev-waba";

const displayPhoneNumber =
    process.env.TEST_WHATSAPP_PHONE_NUMBER!;

const recipientPhoneNumber =
    process.env.TEST_WHATSAPP_RECIPIENT_PHONE_NUMBER!;

async function main() {
    if (!organizationId) {
        throw new Error(
            "TEST_ORGANIZATION_ID is required.",
        );
    }

    if (!phoneNumberId) {
        throw new Error(
            "TEST_WHATSAPP_PHONE_NUMBER_ID is required.",
        );
    }

    if (!accessToken) {
        throw new Error(
            "TEST_WHATSAPP_ACCESS_TOKEN is required.",
        );
    }

    if (!displayPhoneNumber) {
        throw new Error(
            "TEST_WHATSAPP_PHONE_NUMBER is required.",
        );
    }

    if (!recipientPhoneNumber) {
        throw new Error(
            "TEST_WHATSAPP_RECIPIENT_PHONE_NUMBER is required.",
        );
    }

    const accessTokenEncrypted = encryptWhatsAppToken(accessToken);
    
    let account = await prisma.whatsAppAccount.findUnique({
        where: {
            phoneNumberId,
        },
    });

    if (!account) {
        account = await prisma.whatsAppAccount.create({
            data: {
                organizationId,
                businessId,
                wabaId,
                phoneNumberId,
                displayPhoneNumber,
                accessTokenEncrypted,
                status: "ACTIVE",
            },
        });

        console.log("WhatsApp account created:", account.id);
    } else {
        console.log("WhatsApp account already exists:", account.id);
    }

    const existingContact = await prisma.contact.findFirst({
        where: {
            organizationId,
            whatsappAccountId: account?.id,
            phoneNumber: recipientPhoneNumber,
        },
    });

    if (existingContact) {
        console.log("Contact already exists:", existingContact.id);
    } else {
        const contact = await prisma.contact.create({
            data: {
                organizationId,
                whatsappAccountId: account?.id,
                phoneNumber: recipientPhoneNumber,
                name: "Test Contact",
            },
        });

        console.log("Contact created:", contact.id);
    }
}

main()
    .catch((error) => {
        console.log(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });