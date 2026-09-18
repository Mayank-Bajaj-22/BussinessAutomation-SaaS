import express from "express";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { validate } from "../../common/middlewares/validate.middleware.js";
import { createWhatsAppAccountSchema, sendWhatsAppTextMessageSchema, updateWhatsAppAccountSchema } from "./whatsapp.schema.js";
import { connectAccount, disconnectAccount, getAccount, getAccounts, sendMessage, updateAccount } from "./whatsapp.controller.js";

import contactRoutes from "./contact/contact.route.js";
import conversationRoutes from "./conversation/conversation.route.js";

const router = express.Router();

router.use(authMiddleware);

router
    .route("/accounts")
    .post(
        validate(createWhatsAppAccountSchema),
        connectAccount,
    )
    .get(
        getAccounts,
    );

router
    .route("/accounts/:accountId")
    .get(
        getAccount,
    )
    .patch(
        validate(updateWhatsAppAccountSchema),
        updateAccount,
    );

router
    .route("/accounts/:accountId/disconnect")
    .post(
        disconnectAccount,
    );

router
    .route("/accounts/:accountId/messages")
    .post(
        validate(sendWhatsAppTextMessageSchema),
        sendMessage,
    );

router.use(contactRoutes);
router.use(conversationRoutes);

export default router;