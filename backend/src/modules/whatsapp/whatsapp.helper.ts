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

export { getOrganizationId, getAccountId, getContactId };