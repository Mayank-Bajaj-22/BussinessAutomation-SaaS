import { Request, Response } from "express";
import { CatchAsync } from "../../common/utils/CatchAsync.js";
import { availabilityQuerySchema } from "./availability.schema.js";
import { AppError } from "../../common/errors/AppError.js";
import { availabilityService } from "./availability.container.js";
import { sendResponse } from "../../common/utils/sendResponse.js";

export const getAvailability = CatchAsync(
    async (req: Request, res: Response) => {
        const query = availabilityQuerySchema.safeParse(
            req.query,
        );

        if (!query.success) {
            throw new AppError(
                "Invalid availability query",
                400,
            );
        }

        const organizationId = req.user?.organizationId;

        if (!organizationId) {
            throw new AppError(
                "Organization context is missing",
                401,
            );
        }

        const result =
            await availabilityService.getAvailableSlots({
                organizationId,
                serviceId: query.data.serviceId,
                date: query.data.date,
            });

        sendResponse(res, 200, {
            success: true,
            message: "Availability fetched successfully",
            data: result,
        });
    },
);