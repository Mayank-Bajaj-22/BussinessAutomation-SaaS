import { Request, Response } from "express";
import { CatchAsync } from "../../common/utils/CatchAsync.js";
import { whatsappService } from "./whatsapp.container.js";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { sendWhatsAppTextMessageSchema } from "./whatsapp.schema.js";
import { AppError } from "../../common/errors/AppError.js";

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
    }
)