import z from "zod";

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

export type CreateContactDTO = z.infer<typeof createContactSchema>;
export type UpdateContactDTO = z.infer<typeof updateContactSchema>;
export type ListContactsQueryDTO = z.infer<typeof listContactsQuerySchema>;