import { Request, Response } from "express";
import { CatchAsync } from "../../common/utils/CatchAsync.js";
import { getStaffOrganizationId } from "./staff.helper.js";
import { assignStaffServicesSchema, createStaffSchema, staffIdParamsSchema, staffListQuerySchema, staffStatusSchema, updateStaffSchema } from "./staff.schema.js";
import { staffService } from "./staff.container.js";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { toStaffResponse } from "./staff.mapper.js";

export const createStaff = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getStaffOrganizationId(req);
        const input = createStaffSchema.parse(req.body);

        const result = await staffService.createStaff(
            organizationId,
            input,
        );

        sendResponse(res, 201, {
            success: true,
            message: "Staff member created successfully",
            data: toStaffResponse(result),
        });
    },
);

export const listStaff = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getStaffOrganizationId(req);
        const query = staffListQuerySchema.parse(req.query);

        const result = await staffService.listStaff(
            organizationId,
            query,
        );

        sendResponse(res, 200, {
            success: true,
            message: "Staff members fetched successfully",
            data: {
                items: result.items.map(toStaffResponse),
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

export const getStaffById = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getStaffOrganizationId(req);
        const { staffId } = staffIdParamsSchema.parse(req.params);

        const result = await staffService.getStaff(
            organizationId,
            staffId,
        );

        sendResponse(res, 200, {
            success: true,
            message: "Staff member fetched successfully",
            data: toStaffResponse(result),
        });
    },
);

export const updateStaff = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getStaffOrganizationId(req);
        const { staffId } = staffIdParamsSchema.parse(req.params);
        const input = updateStaffSchema.parse(req.body);

        const result = await staffService.updateStaff(
            organizationId,
            staffId,
            input,
        );

        sendResponse(res, 200, {
            success: true,
            message: "Staff member updated successfully",
            data: toStaffResponse(result),
        });
    },
);

export const updateStaffStatus = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getStaffOrganizationId(req);
        const { staffId } = staffIdParamsSchema.parse(req.params);
        const { isActive } = staffStatusSchema.parse(req.body);

        const result = await staffService.setStaffStatus(
            organizationId,
            staffId,
            isActive,
        );

        sendResponse(res, 200, {
            success: true,
            message: `Staff member ${isActive ? "activated" : "deactivated"} successfully`,
            data: toStaffResponse(result),
        });
    },
);  

export const assignStaffServices = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getStaffOrganizationId(req);
        const { staffId } = staffIdParamsSchema.parse(req.params);
        const input = assignStaffServicesSchema.parse(req.body);

        const result = await staffService.assignServices(
            organizationId,
            staffId,
            input,
        );

        sendResponse(res, 200, {
            success: true,
            message: "Staff services assigned successfully",
            data: {
                staff: toStaffResponse(result.staff),
                serviceIds: result.serviceIds,
            },
        });
    },
);