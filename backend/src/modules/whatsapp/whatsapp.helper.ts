import { Request } from "express";
import { AppError } from "../../common/errors/AppError.js";

function getOrganizationId(
    req: Request,
) : string {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
        throw new AppError(
            "Organization ID is missing.",
            401,
        );
    }

    return organizationId;
}

function getAccountId(
    req: Request,
) : string {
    const accountId = req.params.accountId as string;

    if (!accountId) {
        throw new AppError(
            "WhatsApp account ID is required.",
            400,
        );
    }

    return accountId;
}

function getContactId(
    req: Request,
) : string {
    const contactId = req.params.contactId as string;

    if (!contactId) {
        throw new AppError(
            "Contact ID is required.",
            400,
        );
    }

    return contactId;
}

function getConversationId(
    req: Request,
) : string {
    const conversationId = req.params.conversationId as string;

    if (!conversationId) {
        throw new AppError(
            "Conversation ID is required.",
            400,
        );
    }

    return conversationId;
}

function getMessageId(
    req: Request,
) : string {
    const messageId = req.params.messageId as string;

    if (!messageId) {
        throw new AppError(
            "Message ID is required.",
            400,
        );
    }

    return messageId;
}

export { getOrganizationId, getAccountId, getContactId, getConversationId, getMessageId };