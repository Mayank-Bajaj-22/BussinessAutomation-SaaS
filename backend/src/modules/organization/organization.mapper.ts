import { Organization } from "@prisma/client";
import { OrganizationResponseDTO } from "./organization.response.js";

export const toOrganizationResponse = (
    organization: Organization,
) : OrganizationResponseDTO => {
    return {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        timezone: organization.timezone,
        address: organization.address,
        status: organization.status,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
    }
}