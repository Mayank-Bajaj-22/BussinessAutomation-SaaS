import { DayOfWeek } from "@prisma/client";
import z from "zod";

export const updateOrganizationWorkingHoursSchema = z
    .object({
        workingHours: z
            .array(
                z.object({
                    dayOfWeek: z.enum(DayOfWeek),
                    openTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format. Use HH:mm"),
                    closeTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/,"Invalid time format. Use HH:mm",),
                    isClosed: z.boolean(),
                }),
            )
            .length(7),
    })

export type UpdateOrganizationWorkingHoursDTO = z.infer<typeof updateOrganizationWorkingHoursSchema>;