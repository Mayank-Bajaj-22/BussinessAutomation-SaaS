import { OrganizationSettings, Prisma, PrismaClient } from "@prisma/client";
import { IOrganizationSettingsRepository } from "./organization-settings.repository.interface.js";
import { prisma } from "../../lib/prisma.js";

export class OrganizationSettingsRepository implements IOrganizationSettingsRepository {
    constructor(
        private readonly db:
            | PrismaClient
            | Prisma.TransactionClient = prisma,
    ) {}

    findByOrganizationId(organizationId: string): Promise<OrganizationSettings | null> {
        return this.db.organizationSettings.findUnique({
            where: {
                organizationId,
            },
        });
    }

    create(data: Prisma.OrganizationSettingsCreateInput): Promise<OrganizationSettings> {
        return this.db.organizationSettings.create({
            data,
        });
    }

    update(organizationId: string, data: Prisma.OrganizationSettingsUpdateInput): Promise<OrganizationSettings> {
        return this.db.organizationSettings.update({
            where: {
                organizationId,
            },
            data,
        }); 
    }
}