import z from "zod";

export const updateOrganizationSettingsSchema = z
    .object({
        currency: z.string().trim().min(1).max(10).optional(),
        language: z.string().trim().min(2).max(10).optional(),
        timezone: z.string().trim().min(1).max(100).optional(),
    })
    .strict();

export type UpdateOrganizationSettingsDTO = z.infer<typeof updateOrganizationSettingsSchema>;