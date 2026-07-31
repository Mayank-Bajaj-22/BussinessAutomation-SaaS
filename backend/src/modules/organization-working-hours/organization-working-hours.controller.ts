import { Request, Response } from "express";
import { CatchAsync } from "../../common/utils/CatchAsync.js";
import { organizationWorkingHourService } from "./organization-working-hours.container.js";
import { sendResponse } from "../../common/utils/sendResponse.js";

export const getCurrentWorkingHoursController = CatchAsync(
    async (req: Request, res: Response) => {
        const result = 
            await organizationWorkingHourService.getCurrentWorkingHours(
                req.user?.organizationId!
            );

        sendResponse(res, 200, {
            success: true,
            message: "Working hours fetched successfully.",
            data: result,
        });
    }
);

export const updateCurrentWorkingHoursController = CatchAsync(
    async (req: Request, res: Response) => {
        const result = 
            await organizationWorkingHourService.updateCurrentWorkingHours(
                req.user?.organizationId!,
                req.body,
            );

        sendResponse(res, 200, {
            success: true,
            message: "Working hours updated successfully.",
            data: result,
        });
    }
);