import { Request, Response } from "express";
import { CatchAsync } from "../../common/utils/CatchAsync.js";
import { organizationService } from "./organization.container.js";
import { sendResponse } from "../../common/utils/sendResponse.js";

export const getCurrentOrganizationController = CatchAsync(
    async (req: Request, res: Response) => {
        const result = await organizationService.getCurrentOrganization(
            req.user?.organizationId!,
        );

        sendResponse(res, 200, {
            success: true,
            message: "Organization fetched successfully",
            data: result,
        });
    }
);

export const updateCurrentOrganizationController = CatchAsync(
    async (req: Request, res: Response) => {
        const result = 
            await organizationService.updateOrganization(
                req.user?.organizationId!,
                req.body
            );
        
        return sendResponse(res, 200, {
            success: true,
            message: "Organization updated successfully.",
            data: result,
        });
    }
);