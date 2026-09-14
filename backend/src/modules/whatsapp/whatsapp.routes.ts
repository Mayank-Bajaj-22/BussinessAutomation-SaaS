import express from "express";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { validate } from "../../common/middlewares/validate.middleware.js";
import { sendWhatsAppTextMessageSchema } from "./whatsapp.schema.js";
import { sendMessage } from "./whatsapp.controller.js";

const router = express.Router();

router
    .route("/accounts/:accountId/messages")
    .post(
        authMiddleware,
        validate(sendWhatsAppTextMessageSchema),
        sendMessage,
    );

export default router;