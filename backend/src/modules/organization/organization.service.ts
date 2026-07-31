import { Prisma } from "@prisma/client";
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

    async updateOrganization(
        organizationId: string,
        data: Prisma.OrganizationUpdateInput,
    ) {
        const organization =
            await this.organizationRepo.findById(organizationId);

        if (!organization || organization.deletedAt) {
            throw new AppError(
                "Organization not found.",
                404,
            );
        }

        const updatedOrganization = 
            await this.organizationRepo.update(
                organizationId, 
                data,
            );
        
        return toOrganizationResponse(updatedOrganization)
    }
}