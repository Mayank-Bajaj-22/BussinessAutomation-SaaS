import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { MembershipRepository } from "../../modules/membership/membership.repository.js";
import { OrganizationStatus } from "@prisma/client";
import { updateRequestContext } from "../context/requestContext.js";

const membershipRepository = new MembershipRepository();

type OrganizationParams = {
    organizationId?: string;
}

export const organizationMiddleware = async (
    req: Request<OrganizationParams>,
    _res: Response,
    next: NextFunction,
) : Promise<void> => {
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

        if (membership.organization.status !== OrganizationStatus.ACTIVE) {
            throw new AppError(
                "Organization is inactive.",
                403,
            );
        }

        req.organization = membership.organization;
        req.membership = membership;

        updateRequestContext({
            organizationId: organizationId,
            membershipId:membership.id,
        });

        next();
    } catch (error) {
        next(error);
    }
};