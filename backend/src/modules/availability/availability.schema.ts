import { z } from "zod";

export const availabilityQuerySchema = z
    .object({
        serviceId: z.uuid(),
        date: z.iso.date(),
    });

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;