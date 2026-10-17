import { z } from "zod";

const serviceNameSchema = z
    .string()
    .trim()
    .min(2, "Service name must have at least 2 characters")
    .max(100, "Service name cannot exceed 100 characters");

const descriptionSchema = z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .nullable()
    .optional();

const durationSchema = z
    .number()
    .int()
    .min(5, "Duration must be at least 5 minutes")
    .max(1440, "Duration cannot exceed 24 hours");

const priceSchema = z
    .number()
    .min(0, "Price cannot be negative")
    .max(99999999.99, "Price is too high");

export const createServiceSchema = z.object({
    name: serviceNameSchema,
    description: descriptionSchema,
    durationMinutes: durationSchema,
    price: priceSchema,
});

export const updateServiceSchema = z.object({
    name: serviceNameSchema.optional(),
    description: descriptionSchema,
    durationMinutes: durationSchema.optional(),
    price: priceSchema.optional(),
})
.refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
});

export const serviceIdParamsSchema = z.object({
    serviceId: z.uuid("Invalid service ID"),
});

export const serviceListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(),
    isActive: z.enum(["true", "false"]).optional(),
});

export const serviceStatusSchema = z.object({
    isActive: z.boolean(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type ServiceListQuery = z.infer<typeof serviceListQuerySchema>;