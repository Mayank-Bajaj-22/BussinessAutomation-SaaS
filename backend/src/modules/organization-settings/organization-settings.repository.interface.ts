import { OrganizationSettings, Prisma } from "@prisma/client";

export interface IOrganizationSettingsRepository {
    findByOrganizationId(
        organizationId: string,
    ) : Promise<OrganizationSettings | null>;

    create(
        data: Prisma.OrganizationSettingsCreateInput,
    ) : Promise<OrganizationSettings>;

    update(
        organizationId: string,
        data: Prisma.OrganizationSettingsUpdateInput,
    ) : Promise<OrganizationSettings>;
}