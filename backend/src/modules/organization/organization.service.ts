import { AppError } from "../../common/errors/AppError.js";
import { toOrganizationResponse } from "./organization.mapper.js";
import { IOrganizationRepository } from "./organization.repository.interface.js";

export class OrganizationService {
    constructor(
        private organizationRepo: IOrganizationRepository,
    ) {}

    async getCurrentOrganization(
        organizationId: string,
    ) {
        const organization = 
            await this.organizationRepo.findById(organizationId);

        if (!organization) {
            throw new AppError(
                "Organization not found.",
                404,
            );
        }

        if (organization.deletedAt) {
            throw new AppError(
                "Organization has been deleted.",
                404,
            );
        }

        return toOrganizationResponse(organization);
    }
}