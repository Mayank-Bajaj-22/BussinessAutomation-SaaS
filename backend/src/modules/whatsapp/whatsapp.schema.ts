import z from "zod";

export const sendWhatsAppTextMessageSchema = z.object({
    contactId: z
        .uuid("Invalid contact ID."),
    
    body: z
        .string()
        .trim()
        .min(1, "Message cannot be empty.")
        .max(4096, "Message is too long."),
});

export const createWhatsAppAccountSchema = z.object({
    bussinessId: z
        .string()
        .trim()
        .min(1, "Business ID is required."),

    wabaId: z
        .string()
        .trim()
        .min(1, "WABA ID is required."),

    phoneNumberId: z
        .string()
        .trim()
        .min(1, "Phone number ID is required."),

    displayPhoneNumber: z
        .string()
        .trim()
        .min(1, "Display phone number is required."),

    accessToken: z
        .string()
        .trim()
        .min(1, "Access token is required."),
});

export const updateWhatsAppAccountSchema = z.object({
    businessId: z
        .string()
        .trim()
        .min(1)
        .optional(),

    wabaId: z
        .string()
        .trim()
        .min(1)
        .optional(),

    phoneNumberId: z
        .string()
        .trim()
        .min(1)
        .optional(),

    displayPhoneNumber: z
        .string()
        .trim()
        .min(1)
        .optional(),
})
.refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required.",
})

export type SendWhatsAppTextMessageDTO = z.infer<typeof sendWhatsAppTextMessageSchema>;
export type CreateWhatsAppAccountDTO = z.infer<typeof createWhatsAppAccountSchema>;
export type UpdateWhatsAppAccountDTO = z.infer<typeof updateWhatsAppAccountSchema>;