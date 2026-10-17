import { Request, Response } from "express";
import { CatchAsync } from "../../common/utils/CatchAsync.js";
import { serviceService } from "./service.container.js";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { toServiceResponse } from "./service.mapper.js";
import { createServiceSchema, serviceIdParamsSchema, serviceListQuerySchema, serviceStatusSchema, updateServiceSchema } from "./service.schema.js";
import { getOrganizationId } from "./service.helper.js";

export const createService = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const input = createServiceSchema.parse(req.body);

        const result = 
            await serviceService.createService(
                organizationId,
                input,
            );

        sendResponse(res, 201, {
            success: true,
            message: "Service created successfully",
            data: toServiceResponse(
                result,
            ),
        });
    },
);

export const list = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const query = serviceListQuerySchema.parse(req.query);

        const result = 
            await serviceService.listService(
                organizationId,
                query,
            );

        sendResponse(res, 200, {
            success: true,
            message: "Services fetched successfully",
            data: {
                items: result.items.map(toServiceResponse),
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

export const getById = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const { serviceId } = serviceIdParamsSchema.parse(req.params);

        const result = 
            await serviceService.getService(
                organizationId,
                serviceId,
            );

        sendResponse(res, 200, {
            success: true,
            message: "Service fetched successfully",
            data: toServiceResponse(
                result,
            ),
        });
    },
);

export const update = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const { serviceId } = serviceIdParamsSchema.parse(req.params);
        const input = updateServiceSchema.parse(req.body);

        const result = 
            await serviceService.updateService(
                organizationId,
                serviceId,
                input,
            );

        sendResponse(res, 200, {
            success: true,
            message: "Service updated successfully",
            data: toServiceResponse(
                result,
            ),
        });
    },
);

export const updateStatus = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const { serviceId } = serviceIdParamsSchema.parse(req.params);
        const { isActive } = serviceStatusSchema.parse(req.body);

        const result = 
            await serviceService.setServiceStatus(
                organizationId,
                serviceId,
                isActive,
            );

        sendResponse(res, 200, {
            success: true,
            message: `Service ${isActive ? "activated" : "deactivated"} successfully`,
            data: toServiceResponse(
                result,
            ),
        })
    },
);