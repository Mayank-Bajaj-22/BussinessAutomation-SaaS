import { Organization, Prisma } from "@prisma/client";

export interface IOrganizationRepository {
    findById(
        organizationId: string,
    ) : Promise<Organization | null>;

    findBySlug(
        slug: string,
    ) : Promise<Organization | null>;

    create(
        data: Prisma.OrganizationCreateInput,
    ) : Promise<Organization>;

    update(
        organizationId: string,
        data: Prisma.OrganizationUpdateInput,
    ) : Promise<Organization>;

    softDelete(
        organizationId: string,
    ) : Promise<Organization>;
} 