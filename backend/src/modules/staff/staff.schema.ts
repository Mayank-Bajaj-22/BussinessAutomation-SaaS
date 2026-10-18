import { z } from "zod";

const nameSchema = z
    .string()
    .trim()
    .min(2, "Name must have at least 2 characters")
    .max(100, "Name cannot exceed 100 characters");

const emailSchema = z
    .email("Invalid email address")
    .trim()
    .max(254)
    .transform((value) => value.toLowerCase())
    .nullable()
    .optional();

const phoneSchema = z
    .string()
    .trim()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long")
    .nullable()
    .optional();

export const createStaffSchema = z
    .object({
        name: nameSchema,
        email: emailSchema,
        phone: phoneSchema,
    });

export const updateStaffSchema = z
    .object({
        name: nameSchema.optional(),
        email: emailSchema,
        phone: phoneSchema,
    })
    .refine(
        (data) => 
            data.name !== undefined ||
            data.email !== undefined ||
            data.phone !== undefined,
            {
                message: "At least one field must be provided",
            },
    );

export const staffIdParamsSchema = z
    .object({
        staffId: z.string("Invalid staff ID"),
    });

export const staffListQuerySchema = z
    .object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        search: z.string().trim().max(100).optional(),
        isActive: z.enum(["true", "false"]).optional(),
    });

export const staffStatusSchema = z
    .object({
        isActive: z.boolean(),
    });

export const assignStaffServicesSchema = z
    .object({
        serviceIds: z.array(z.string()).max(100),
    });

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type StaffListQuery = z.infer<typeof staffListQuerySchema>;
export type AssignStaffServicesInput = z.infer<typeof assignStaffServicesSchema>;