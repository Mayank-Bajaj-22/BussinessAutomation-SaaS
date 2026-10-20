import { AppointmentStatus } from "@prisma/client";
import { z } from "zod";

const isoDateTimeSchema = z.iso.datetime({
    offset: true,
});

export const createAppointmentSchema = z
    .object({
        contactId: z.uuid(),
        serviceId: z.uuid(),
        staffId: z.uuid(),
        startAt: isoDateTimeSchema,
        customerNote: z
            .string()
            .trim()
            .max(1000)
            .nullable()
            .optional(),
        idempotencyKey: z
            .string()
            .trim()
            .min(8)
            .max(128)
            .optional(),
    });

export const appointmentIdParamsSchema = z
    .object({
        appointmentId: z.uuid(),
    });

export const appointmentListQuerySchema = z
    .object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        status: z.enum(AppointmentStatus).optional(),
        staffId: z.string().uuid().optional(),
        contactId: z.string().uuid().optional(),
        from: isoDateTimeSchema.optional(),
        to: isoDateTimeSchema.optional(),
    })
    .refine(
        (query) => 
            query.from === undefined ||
            query.to === undefined ||
            new Date(query.from) <= new Date(query.to),
        {
            message: "'from' must be earlier than or equal to 'to'",
            path: ["from"],
        },
    );

export const updateAppointmentStatusSchema = z
    .object({
        status: z.enum([
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.CANCELLED,
            AppointmentStatus.COMPLETED,
            AppointmentStatus.NO_SHOW,
        ]),
        cancellationReason: z
            .string()
            .trim()
            .max(500)
            .optional(),
    });

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type AppointmentListQuery = z.infer<typeof appointmentListQuerySchema>;
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;   