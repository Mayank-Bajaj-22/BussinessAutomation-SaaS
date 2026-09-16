import express from "express";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { validate } from "../../common/middlewares/validate.middleware.js";
import { createContactSchema, createWhatsAppAccountSchema, listContactsQuerySchema, sendWhatsAppTextMessageSchema, updateContactSchema, updateWhatsAppAccountSchema } from "./whatsapp.schema.js";
import { connectAccount, createContact, deleteContact, disconnectAccount, getAccount, getAccounts, getContact, getContacts, sendMessage, updateAccount, updateContact } from "./whatsapp.controller.js";

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

router
    .route("/accounts/:accountId/contacts")
    .post(
        authMiddleware,
        validate(createContactSchema),
        createContact,
    );

router
    .route("/accounts/:accountId/contacts")
    .get(
        authMiddleware,
        validate(listContactsQuerySchema, "query"),
        getContacts,
    );

router
    .route("/accounts/:accountId/contacts/:contactId")
    .get(
        authMiddleware,
        getContact,
    );

router
    .route("/accounts/:accountId/contacts/:contactId")
    .patch(
        authMiddleware,
        validate(updateContactSchema),
        updateContact,
    );

router
    .route("/accounts/:accountId/contacts/:contactId")
    .delete(
        authMiddleware,
        deleteContact,
    );

export default router;