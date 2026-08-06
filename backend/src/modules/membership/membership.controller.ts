import { Request, Response } from "express";
import { CatchAsync } from "../../common/utils/CatchAsync.js";
import { membershipService } from "./membership.container.js";
import { sendResponse } from "../../common/utils/sendResponse.js";

export const memberInviteController = CatchAsync(
    async (req: Request, res: Response) => {
        const result = await membershipService.inviteMember(
            req.user?.userId!,
            req.organization!,
            req.body,
        );

        return sendResponse(res, 201, {
            success: true,
            message: "Invitation sent successfully.",
            data: result,
        });
    }
);

export const acceptInvitationController = CatchAsync(
    async (req: Request, res: Response) => {
        const result = await membershipService.acceptInvitation(
            req.body,
        );

        sendResponse(res, 200, {
            success: true,
            message: "Invitation accepted successfully.",
            data: result,
        });
    }
);