import { Request, Response } from "express";

import { CatchAsync } from "../../common/utils/CatchAsync.js";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { getOrganizationId } from "./appointment.helper.js";
import { appointmentService } from "./appointment.container.js";
import { toAppointmentResponse } from "./appointment.mapper.js";
import {
    appointmentIdParamsSchema,
    appointmentListQuerySchema,
    createAppointmentSchema,
    updateAppointmentStatusSchema,
} from "./appointment.schema.js";

export const createAppointment = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const input = createAppointmentSchema.parse(req.body);

        const result = await appointmentService.createAppointment(
            organizationId,
            input,
        );

        sendResponse(res, 201, {
            success: true,
            message: "Appointment created successfully",
            data: toAppointmentResponse(result),
        });
    },
);

export const listAppointments = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const query = appointmentListQuerySchema.parse(req.query);

        const result = await appointmentService.listAppointments(
            organizationId,
            query,
        );

        sendResponse(res, 200, {
            success: true,
            message: "Appointments fetched successfully",
            data: {
                items: result.items.map(toAppointmentResponse),
                pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
                },
            },
        });
    },
);

export const getAppointmentById = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const { appointmentId } = appointmentIdParamsSchema.parse(req.params);

        const result = await appointmentService.getAppointment(
            organizationId,
            appointmentId,
        );

        sendResponse(res, 200, {
            success: true,
            message: "Appointment fetched successfully",
            data: toAppointmentResponse(result),
        });
    },
);

export const updateAppointmentStatus = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const { appointmentId } = appointmentIdParamsSchema.parse(req.params);

        const input = updateAppointmentStatusSchema.parse(req.body);

        const result =
            await appointmentService.updateAppointmentStatus(
                organizationId,
                appointmentId,
                input,
            );

        sendResponse(res, 200, {
            success: true,
            message: "Appointment status updated successfully",
            data: toAppointmentResponse(result),
        });
    },
);