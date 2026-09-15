import express from "express";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { validate } from "../../common/middlewares/validate.middleware.js";
import { createWhatsAppAccountSchema, sendWhatsAppTextMessageSchema, updateWhatsAppAccountSchema } from "./whatsapp.schema.js";
import { connectAccount, disconnectAccount, getAccount, getAccounts, sendMessage, updateAccount } from "./whatsapp.controller.js";

const router = express.Router();

router
    .route("/accounts")
    .post(
        authMiddleware,
        validate(createWhatsAppAccountSchema),
        connectAccount,
    );

router
    .route("/accounts")
    .get(
        authMiddleware,
        getAccounts,
    );

router
    .route("/accounts/:accountId")
    .get(
        authMiddleware,
        getAccount,
    );

router
    .route("/accounts/:accountId")
    .patch(
        authMiddleware,
        validate(updateWhatsAppAccountSchema),
        updateAccount,
    );

router
    .route("/accounts/:accountId/disconnect")
    .post(
        authMiddleware,
        disconnectAccount,
    );

router
    .route("/accounts/:accountId/messages")
    .post(
        authMiddleware,
        validate(sendWhatsAppTextMessageSchema),
        sendMessage,
    );

export default router;