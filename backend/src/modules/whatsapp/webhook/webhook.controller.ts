import { Request, Response } from "express";
import { CatchAsync } from "../../../common/utils/CatchAsync.js";
import { webhookService } from "./webhook.container.js";

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