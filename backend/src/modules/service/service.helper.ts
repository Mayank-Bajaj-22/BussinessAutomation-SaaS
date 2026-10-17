import { Request } from "express";
import { AppError } from "../../common/errors/AppError.js";

function getOrganizationId(
    req: Request,
) : string {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
        throw new AppError(
            "Organization ID is missing.",
            401,
        );
    }

    return organizationId;
}

export { getOrganizationId };