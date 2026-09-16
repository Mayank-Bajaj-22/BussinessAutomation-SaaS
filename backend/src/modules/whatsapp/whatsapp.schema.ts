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
    businessId: z
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

export const createContactSchema = z.object({
    phoneNumber: z
        .string()
        .trim()
        .min(1, "Phone number is required.")
        .max(30, "Phone number is too long."),

    name: z
        .string()
        .trim()
        .min(1, "Contact name cannot be empty.")
        .max(100, "Contact name is too long.")
        .optional(),
});

export const updateContactSchema = z.object({
    phoneNumber: z
        .string()
        .trim()
        .min(1, "Phone number cannot be empty.")
        .max(30, "Phone number is too long.")
        .optional(),

    name: z
        .string()
        .trim()
        .min(1, "Contact name cannot be empty.")
        .max(100, "Contact name is too long.")
        .optional(),
})
.refine((data) => data.phoneNumber !== undefined || data.name !== undefined, {
    message: "At least one field is required."
});

export const listContactsQuerySchema = z.object({
    page: z
        .coerce
        .number()
        .int()
        .min(1)
        .default(1),

    limit: z
        .coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(20),

    search: z
        .string()
        .trim()
        .min(1)
        .max(100)
        .optional(),
});

export type SendWhatsAppTextMessageDTO = z.infer<typeof sendWhatsAppTextMessageSchema>;
export type CreateWhatsAppAccountDTO = z.infer<typeof createWhatsAppAccountSchema>;
export type UpdateWhatsAppAccountDTO = z.infer<typeof updateWhatsAppAccountSchema>;
export type CreateContactDTO = z.infer<typeof createContactSchema>;
export type UpdateContactDTO = z.infer<typeof updateContactSchema>;
export type ListContactsQueryDTO = z.infer<typeof listContactsQuerySchema>;