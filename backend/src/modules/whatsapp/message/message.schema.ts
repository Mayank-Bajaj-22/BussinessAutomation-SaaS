import z from "zod";

export const sendMessageSchema = z.object({
    contactId: z
        .uuid(),
    body: z
        .string()
        .trim()
        .min(1, "Message body is required")
        .max(4096, "Message body cannot exceed 4096 characters"),
});

export const messageIdParamsSchema = z.object({
    accountId: z.uuid(),
    messageId: z.uuid(),
});