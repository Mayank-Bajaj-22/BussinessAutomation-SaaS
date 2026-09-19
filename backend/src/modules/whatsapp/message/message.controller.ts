import { Request, Response } from "express";
import { CatchAsync } from "../../../common/utils/CatchAsync.js";
import { getAccountId, getMessageId, getOrganizationId } from "../whatsapp.helper.js";
import { messageService } from "./message.container.js";
import { sendMessageResponse } from "./message.response.js";
import { toMessageResponse } from "./message.mapper.js";
import { sendResponse } from "../../../common/utils/sendResponse.js";

export const sendMessage = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const accountId = getAccountId(req);

        const { contactId, body } = req.body;

        const message = 
            await messageService.sendTextMessage(
                {
                    organizationId,
                    whatsappAccountId: accountId,
                    contactId,
                    body,
                },
            );

        sendResponse(res, 200, {
            success: true,
            message: "Message sent successfully.",
            data: sendMessageResponse(
                message,
            ),
        });
    },
);

export const getMessage = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const accountId = getAccountId(req);
        const messageId = getMessageId(req);

        const message = 
            await messageService.getMessage(
                organizationId,
                accountId,
                messageId,
            );

        sendResponse(res, 200, {
            success: true,
            message: "Message feteched successfully.",
            data: toMessageResponse(
                message,
            ),
        });
    },
);