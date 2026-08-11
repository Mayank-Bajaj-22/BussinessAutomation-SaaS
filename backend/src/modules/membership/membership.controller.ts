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

export const rejectInvitationController = CatchAsync(
    async (req: Request, res: Response) => {
        const result = await membershipService.rejectInvitation(
            req.body,
        );

        sendResponse(res, 200, {
            success: true,
            message: "Invitation rejected successfully.",
            data: result,
        });
    }
);

export const getMembersController = CatchAsync(
    async (req: Request, res: Response) => {
        const result = await membershipService.getAllMembers(
            req.organization!,
        );

        sendResponse(res, 200, {
            success: true,
            message: "Members fetched successfully.",
            data: result,
        });
    }
);

export const getMembersByIdController = CatchAsync(
    async (req: Request, res: Response) => {
        const { membershipId } = req.params;
            
        const result = await membershipService.getMemberById(
            req.organization!,
            req.params.membershipId as string,
        );

        sendResponse(res, 200, {
            success: true,
            message: "Member fetched successfully.",
            data: result,
        });
    }
);

export const changeMemberRoleController = CatchAsync(
    async (req: Request, res: Response) => {
        const result = await membershipService.changeMemberRole(
            req.body,
            req.membership!.id,
            req.organization!,
            req.params.membershipId as string,
        );

        return sendResponse(res, 200, {
            success: true,
            message: "Member role updated successfully.",
            data: result,
        });
    }
);

export const suspendMemberController = CatchAsync(
    async (req: Request, res: Response) => {
        const result = await membershipService.suspendMember(
            req.membership!.id,
            req.organization!,
            req.params.membershipId as string,
        );

        sendResponse(res, 200, {
            success: true,
            message: "Member suspended successfully.",
            data: result,
        });
    }
);

export const activateMemberController = CatchAsync(
    async (req: Request, res: Response) => {
        const result = await membershipService.activateMember(
            req.membership!.id,
            req.organization!,
            req.params.membershipId as string,
        );

        sendResponse(res, 200, {
            success: true,
            message: "Member activated successfully.",
            data: result,
        });
    }
);

export const removeMemberController = CatchAsync(
    async (req: Request, res: Response) => {
        const result = await membershipService.removeMember(
            req.membership!.id,
            req.organization!,
            req.params.membershipId as string,
        );

        sendResponse(res, 200, {
            success: true,
            message: "Member removed successfully.",
            data: result,
        });
    }
);

export const cancelInvitationController = CatchAsync(
    async (req: Request, res: Response) => {
        const result = await membershipService.cancelInvitation(
            req.membership!.id,
            req.organization!,
            req.params.membershipId as string,
        );

        sendResponse(res, 200, {
            success: true,
            message: "Invitation cancelled successfully.",
            data: result,
        });
    }
);

export const transferOwnershipController = CatchAsync(
    async (req: Request, res: Response) => {
        const result = await membershipService.tranferOwnership(
            req.membership!.id,
            req.organization!,
            req.body,
        );

        sendResponse(res, 200, {
            success: true,
            message: "Ownership transferred successfully.",
            data: result,
        });
    }
);

export const leaveOrganizationController = CatchAsync(
    async (req: Request, res: Response) => {
        const result =
            await membershipService.LeaveOrganization(
                req.membership!.id,
                req.organization!,
            );

        sendResponse(res, 200, {
            success: true,
            message: "You left the organization successfully.",
            data: result,
        });
    }
);