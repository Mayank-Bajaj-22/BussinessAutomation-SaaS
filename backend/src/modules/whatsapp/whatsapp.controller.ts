import { Request, Response } from "express";
import { CatchAsync } from "../../common/utils/CatchAsync.js";
import { whatsappService } from "./whatsapp.container.js";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { ListContactsQueryDTO, sendWhatsAppTextMessageSchema } from "./whatsapp.schema.js";
import { AppError } from "../../common/errors/AppError.js";
import { encryptWhatsAppToken } from "./whatsapp.crypto.js";
import { mapContactToResponse, toWhatsAppAccountResponse } from "./whatsapp.mapper.js";
import { UpdateWhatsAppAccountData } from "./whatsapp.repository.interface.js";
import { getAccountId, getContactId, getOrganizationId } from "./whatsapp.helper.js";

export const sendMessage = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const accountId = getAccountId(req);

        if (!organizationId) {
            throw new AppError(
                "Organization ID is missing.",
                404,
            );
        }

        const { contactId, body } = req.body;

        const message = await whatsappService.sendTextMessage({
            organizationId,
            whatsappAccountId: accountId,
            contactId,
            body,
        });

        sendResponse(res, 201, {
            success: true,
            message: "Message send successfully.",
            data: message,
        });
    },
);

export const connectAccount = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);

        const { businessId, wabaId, phoneNumberId, displayPhoneNumber, accessToken } = req.body;

        const encryptedToken = encryptWhatsAppToken(accessToken);

        const account = 
            await whatsappService.connectAccount({
                organizationId,
                businessId,
                wabaId,
                phoneNumberId,
                displayPhoneNumber,
                accessTokenEncrypted: encryptedToken,
            });

        sendResponse(res, 201, {
            success: true,
            message: "WhatsApp account connected successfully.",
            data: toWhatsAppAccountResponse(account),
        });
    },
);

export const getAccounts = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);

        const accounts = 
            await whatsappService.getOrganizationAccounts(
                organizationId,
            );

        sendResponse(res, 200, {
            success: true,
            message: "WhatsApp accounts fetched successfully.",
            data: accounts.map(
                toWhatsAppAccountResponse,
            ),
        });
    },
);

export const getAccount = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const accountId = getAccountId(req);

        const account = 
            await whatsappService.getAccount(
                organizationId,
                accountId,
            );

        sendResponse(res, 200, {
            success: true,
            message: "WhatsApp account fetched successfully.",
            data: toWhatsAppAccountResponse(
                account,
            ),
        });
    },
);

export const updateAccount = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const accountId = getAccountId(req);

        const account = 
            await whatsappService.updateAccount(
                organizationId,
                accountId,
                req.body as UpdateWhatsAppAccountData,
            );
        
        sendResponse(res, 200, {
            success: true,
            message: "WhatsApp account updated successfully.",
            data: toWhatsAppAccountResponse(
                account,
            ),
        });
    },
);

export const disconnectAccount = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const accountId = getAccountId(req);

        const account = 
            await whatsappService.disconnectAccount(
                organizationId,
                accountId,
            );

        sendResponse(res, 200, {
            success: true,
            message: "WhatsApp account disconnected successfully.",
            data: toWhatsAppAccountResponse(
                account,
            ),
        });
    },
);

export const createContact = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const accountId = getAccountId(req);

        const { phoneNumber, name } = req.body;

        const contact = await whatsappService.createContact(
            organizationId,
            accountId,
            {
                organizationId,
                whatsappAccountId: accountId,
                phoneNumber,
                name,
            },
        );

        sendResponse(res, 201, {
            success: true,
            message: "Contact created successfully.",
            data: mapContactToResponse(
                contact,
            ),
        });
    },
);

export const getContact = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const accountId = getAccountId(req);
        const contactId = getContactId(req);

        const contact = await whatsappService.getContact(
            organizationId,
            accountId,
            contactId,
        );

        sendResponse(res, 200, {
            success: true,
            message: "Contact fetched successfully.",
            data: mapContactToResponse(
                contact,
            ),
        });
    },
);

export const getContacts = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const accountId = getAccountId(req);

        const { page, limit, search } = res.locals.validated.query as unknown as ListContactsQueryDTO;

        const result = await whatsappService.listContacts(
            organizationId,
            accountId,
            {
                page,
                limit,
                search,
            },
        );

        const totalPages = Math.ceil(result.total / limit);

        sendResponse(res, 200, {
            success: true,
            message: "Contacts fetched successfully.",
            data: {
                contacts: result.contacts.map(
                    mapContactToResponse,
                ),
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                },
            },
        });
    },
);

export const updateContact = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const accountId = getAccountId(req);
        const contactId = getContactId(req);

        const { phoneNumber, name } = req.body;

        const contact = await whatsappService.updateContact(
            organizationId,
            accountId,
            contactId,
            {
                phoneNumber,
                name,
            },
        );

        sendResponse(res, 200, {
            success: true,
            message: "Contact updated successfully.",
            data: mapContactToResponse(
                contact,
            ),
        });
    },
);

export const deleteContact = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const accountId = getAccountId(req);
        const contactId = getContactId(req);

        const contact = await whatsappService.deleteContact(
            organizationId,
            accountId,
            contactId,
        );

        sendResponse(res, 200, {
            success: true,
            message: "Contact deleted successfully.",
            data: mapContactToResponse(
                contact,
            ),
        });
    },
);