import { Request, Response } from "express";
import { CatchAsync } from "../../common/utils/CatchAsync.js";
import { whatsappService } from "./whatsapp.container.js";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { sendWhatsAppTextMessageSchema } from "./whatsapp.schema.js";
import { AppError } from "../../common/errors/AppError.js";
import { encryptWhatsAppToken } from "./whatsapp.crypto.js";
import { toWhatsAppAccountResponse } from "./whatsapp.mapper.js";
import { UpdateWhatsAppAccountData } from "./whatsapp.repository.interface.js";

export const sendMessage = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = req.user?.organizationId;
        const accountId = req.params.accountId as string;

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
        const organizationId = req.user?.organizationId;

        if (!organizationId) {
            throw new AppError(
                "Organization ID is missing.",
                401,
            );
        }

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
        const organizationId = req.user?.organizationId;

        if (!organizationId) {
            throw new AppError(
                "Organization ID is missing.",
                401,
            );
        }

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
        const organizationId = req.user?.organizationId;

        const accountId = req.params.accountId as string;

        if (!organizationId) {
            throw new AppError(
                "Organization ID is missing.",
                401,
            );
        }

        if (!accountId) {
            throw new AppError(
                "WhatsApp account ID is required.",
                400,
            );
        }

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
        const organizationId = req.user?.organizationId;

        const accountId = req.params.accountId as string;

        if (!organizationId) {
            throw new AppError(
                "Organization ID is missing.",
                401,
            );
        }

        if (!accountId) {
            throw new AppError(
                "WhatsApp account ID is required.",
                400,
            );
        }

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
        const organizationId = req.user?.organizationId;

        const accountId = req.params.accountId as string;

        if (!organizationId) {
            throw new AppError(
                "Organization ID is missing.",
                401,
            );
        }

        if (!accountId) {
            throw new AppError(
                "WhatsApp account ID is required.",
                400,
            );
        }

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