import z from "zod";

export const updateOrganizationSchema = z
    .object({
        name: z.string().trim().min(2).max(100).optional(),
        logoUrl: z.url().optional(),
        website: z.url().optional(),
        phone: z.string().max(20).optional(),
        address: z.string().max(255).optional(),
    })
    .strict();

export type UpdateOrganizationDTO = z.infer<typeof updateOrganizationSchema>;