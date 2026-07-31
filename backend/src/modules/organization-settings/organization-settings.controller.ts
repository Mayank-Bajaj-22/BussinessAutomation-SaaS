import { Request, Response } from "express";
import { CatchAsync } from "../../common/utils/CatchAsync.js";
import { organizationSettingsService } from "./organization-settings.container.js";
import { sendResponse } from "../../common/utils/sendResponse.js";

export const getCurrentOrganizationSettingsController = CatchAsync(
    async (req: Request, res: Response) => {
        const result = 
            await organizationSettingsService.getCurrentOrganizationSettings(
                req.user?.organizationId!
            );

        sendResponse(res, 200, {
            success: true,
            message: "Organization settings fetched successfully.",
            data: result,
        });
    }
);

export const updateCurrentOrganizationSettingsController = CatchAsync(
    async (req: Request, res: Response) => {
        const result = 
            await organizationSettingsService.updateCurrentOrganizationSettings(
                req.user?.organizationId!,
                req.body,
            );

        sendResponse(res, 200, {
            success: true,
            message: "Organization settings updated successfully.",
            data: result,
        });
    }
);