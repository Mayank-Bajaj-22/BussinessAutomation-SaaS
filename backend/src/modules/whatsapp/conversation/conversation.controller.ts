import { Request, Response } from "express";
import { CatchAsync } from "../../../common/utils/CatchAsync.js";
import { getAccountId, getContactId, getConversationId, getOrganizationId } from "../whatsapp.helper.js";
import { conversationService } from "./conversation.container.js";
import { sendResponse } from "../../../common/utils/sendResponse.js";
import { conversationListResponse, conversationResponse } from "./conversation.response.js";
import { AppError } from "../../../common/errors/AppError.js";

export const createConversation = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const accountId = getAccountId(req);

        const { contactId } = req.body;

        const conversation = await conversationService.createConversation({
            organizationId,
            whatsappAccountId: accountId,
            contactId,
            status: undefined,
            lastMessageAt: new Date(),
        });

        sendResponse(res, 201, {
            success: true,
            message: "Conversation created successfully.",
            data: conversationResponse(
                conversation,
            ),
        });
    },
);

export const listConversations = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const accountId = getAccountId(req);

        const page = Math.max(
            Number(req.query.page ?? 1),
            1,
        );

        const limit = Math.min(
            Math.max(
                Number(
                    req.query.limit ?? 20,
                ),
            ),
            100,
        );

        const status = req.query.status as any;

        const result = await conversationService.listConversations(
            organizationId,
            accountId,
            {
                page,
                limit,
                status,
            },
        );

        sendResponse(res, 200, {
            success: true,
            message: "Conversations fetched successfully.",
            data: conversationListResponse(
                result.conversations,
                page,
                limit,
                result.total,
            ),
        });
    },
);

export const getConversation = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const accountId = getAccountId(req);
        const conversationId = getConversationId(req);

        const conversation = await conversationService.getConversation(
            organizationId,
            accountId,
            conversationId,
        );

        sendResponse(res, 200, {
            success: true,
            message: "Conversation fetched successfully.",
            data: conversationResponse(
                conversation,
            ),
        });
    },
);

export const listContactConversations = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const accountId = getAccountId(req);
        const contactId = getContactId(req); 

        const page = Math.max(
            Number(req.query.page ?? 1),
            1,
        );

        const limit = Math.min(
            Math.max(
                Number(
                    req.query.limit ?? 20,
                ),
            ),
            100,
        );

        const status = req.query.status as any;

        const result = await conversationService.listContactConversations(
            organizationId,
            accountId,
            contactId,
            {
                page,
                limit,
                status,
            },
        );

        sendResponse(res, 200, {
            success: true,
            message: "Contact conversations fetched successfully.",
            data: conversationListResponse(
                result.conversations,
                page,
                limit,
                result.total,
            ),
        });
    },
);

export const updateConversation = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const accountId = getAccountId(req);
        const conversationId = getConversationId(req);

        const conversation = await conversationService.updateConversation(
            organizationId,
            accountId,
            conversationId,
            req.body,
        );

        sendResponse(res, 200, {
            success: true,
            message: "onversation updated successfully.",
            data: conversationResponse(
                conversation,
            ),
        });
    },
);

export const closeConversation = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const accountId = getAccountId(req);
        const conversationId = getConversationId(req);

        const conversation = await conversationService.closeConversation(
            organizationId,
            accountId,
            conversationId,
        );

        sendResponse(res, 200, {
            success: true,
            message: "Conversation closed successfully.",
            data: conversationResponse(
                conversation,
            ),
        });
    },
);

export const reopenConversation = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const accountId = getAccountId(req);
        const conversationId = getConversationId(req);

        const conversation = await conversationService.reopenConversation(
            organizationId,
            accountId,
            conversationId,
        );

        sendResponse(res, 200, {
            success: true,
            message: "Conversation reopened successfully.",
            data: conversationResponse(
                conversation,
            ),
        });
    },
);