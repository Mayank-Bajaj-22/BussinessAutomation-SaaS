import express from "express";
import { authMiddleware } from "../../../common/middlewares/auth.middleware.js";
import { validate } from "../../../common/middlewares/validate.middleware.js";
import { sendMessageSchema } from "./message.schema.js";
import { getMessage, sendMessage } from "./message.controller.js";

const router = express.Router();

router.use(
    authMiddleware,
);

router
    .route("/accounts/:accountId/messages")
    .post(
        validate(sendMessageSchema),
        sendMessage,
    );

router
    .route("/accounts/:accountId/messages/:messageId")
    .get(
        getMessage,
    );

export default router;