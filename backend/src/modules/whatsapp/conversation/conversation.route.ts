import express from "express";
import { authMiddleware } from "../../../common/middlewares/auth.middleware.js";
import { validate } from "../../../common/middlewares/validate.middleware.js";
import { createConversationSchema, updateConversationSchema } from "./conversation.schema.js";
import { closeConversation, createConversation, getConversation, listContactConversations, listConversations, reopenConversation, updateConversation } from "./conversation.controller.js";

const router = express.Router();

router
    .route("/accounts/:accountId/conversations")
    .post(
        validate(createConversationSchema),
        createConversation,
    )
    .get(
        listConversations,
    );

router
    .route("/accounts/:accountId/conversations/:conversationId")
    .get(
        getConversation,
    )
    .patch(
        validate(updateConversationSchema),
        updateConversation,
    );

router
    .route("/accounts/:accountId/contacts/:contactId/conversations")
    .get(
        listContactConversations,
    );

router
    .route("/accounts/:accountId/conversations/:conversationId/close")
    .post(
        closeConversation,
    );

router
    .route("/accounts/:accountId/conversations/:conversationId/reopen")
    .post(
        reopenConversation,
    );

export default router;