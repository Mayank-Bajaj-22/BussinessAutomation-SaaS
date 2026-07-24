import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { MembershipRepository } from "../../modules/membership/membership.repository.js";

const membershipRepository = new MembershipRepository();

interface OrganizationParams {
    organizationId: string;
}

export const organizationMiddleware = async (
    req: Request<OrganizationParams>,
    res: Response,
    next: NextFunction,
) => {
    try {
        if (!req.user?.userId) {
            throw new AppError("Unauthorized.", 401);
        }

        const organizationId =
            req.params.organizationId ??
            req.user.organizationId;

        if (!organizationId) {
            throw new AppError(
                "Organization ID is required.",
                400,
            );
        }

        const membership =
            await membershipRepository.findActiveMembershipWithOrganization(
                req.user.userId,
                organizationId,
            );

        if (!membership) {
            throw new AppError(
                "You are not a member of this organization.",
                403,
            );
        }

        if (membership.organization.deletedAt) {
            throw new AppError(
                "Organization has been deleted.",
                403,
            );
        }

        if (membership.organization.status !== "ACTIVE") {
            throw new AppError(
                "Organization is inactive.",
                403,
            );
        }

        req.organization = membership.organization;
        req.membership = membership;

        next();
    } catch (error) {
        next(error);
    }
};