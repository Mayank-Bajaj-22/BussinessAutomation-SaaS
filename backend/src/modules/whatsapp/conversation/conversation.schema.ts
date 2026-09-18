import { ConversationStatus } from "@prisma/client";
import z from "zod";

const uuidSchema = z.string().uuid();

export const createConversationSchema = z.object({
    contactId: uuidSchema,
});

export const listConversationsSchema = z.object({
    page: z.coerce
        .number()
        .int()
        .min(1)
        .default(1),

    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(20),

    status: z
        .enum(ConversationStatus)
        .optional(),
});

export const updateConversationSchema = z.object({
    status: z
        .enum(ConversationStatus)
        .optional(),

    lastMessageAt: z
        .coerce
        .date()
        .optional(),
});

export const conversationIdParamSchema = z.object({
    conversationId: uuidSchema,
});

export const accountIdParamSchema = z.object({
    accountId: uuidSchema,
});

export const accountAndConversationParamSchema = z.object({
    accountId: uuidSchema,
    conversationId: uuidSchema,
});

export const accountAndContactParamSchema = z.object({
    accountId: uuidSchema,
    contactId: uuidSchema,
});

export type CreateConversationDTO = z.infer<typeof createConversationSchema>;
export type ListConversationsDTO = z.infer<typeof listConversationsSchema>;
export type UpdateConversationDTO = z.infer<typeof updateConversationSchema>;