import { Request, Response } from "express";
import { CatchAsync } from "../../../common/utils/CatchAsync.js";
import { webhookService } from "./webhook.container.js";
import { sendResponse } from "../../../common/utils/sendResponse.js";

export const verify = CatchAsync(
    async (req: Request, res: Response) => {
        const mode = req.query["hub.mode"];
        const verifyToken = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];

        const normalizedMode = 
            typeof mode === "string"
            ? mode
            : undefined;

        const normalizedVerifyToken = 
            typeof verifyToken === "string"
            ? verifyToken
            : undefined;

        const normalizedChallenge = 
            typeof challenge === "string"
            ? challenge 
            : undefined;

        const result = await webhookService.verifyWebhook({
            mode: normalizedMode,
            verifyToken: normalizedVerifyToken,
            challenge: normalizedChallenge,
        });

        return res
            .status(200)
            .type("text/plain")
            .send(result);
    },
);

export const receive = CatchAsync(
    async (req: Request, res: Response) => {
        if (!req.rawBody) {
            return res.status(400).json({
                success: false,
                message: "Raw webhook body is missing",
            });
        }

        const signature = req.header("x-hub-signature-256");

        const result = await webhookService.processWebhook({
            rawBody: req.rawBody,
            signature,
            payload: req.body,
        });

        sendResponse(res, 200, {
            success: true,
            message: "Webhook received successfully",
            data: result,
        });
    }
)