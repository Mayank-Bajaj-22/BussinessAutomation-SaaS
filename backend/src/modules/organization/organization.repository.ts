import { Organization, OrganizationStatus, Prisma, PrismaClient } from "@prisma/client";
import { IOrganizationRepository } from "./organization.repository.interface.js";
import { prisma } from "../../lib/prisma.js";

export class OrganizationRepository implements IOrganizationRepository {
    constructor(
        private readonly db:
            | PrismaClient
            | Prisma.TransactionClient = prisma,
    ) {}

    async findById(
        organizationId: string,
    ) : Promise<Organization | null> {
        return this.db.organization.findUnique({
            where: {
                id: organizationId,
            },
        });
    }

    findBySlug(
        slug: string,
    ): Promise<Organization | null> {
        return this.db.organization.findUnique({
            where: {
                slug,
            },
        });
    }

    async create(
        data: Prisma.OrganizationCreateInput,
    ): Promise<Organization> {
        return this.db.organization.create({
            data,
        });
    }

    async update(
        organizationId: string, 
        data: Prisma.OrganizationUpdateInput,
    ): Promise<Organization> {
        return this.db.organization.update({
            where: {
                id: organizationId,
            },
            data,
        });
    }

    async softDelete(
        organizationId: string,
    ): Promise<Organization> {
        return this.db.organization.update({
            where: {
                id: organizationId,
            },
            data: {
                status: OrganizationStatus.INACTIVE,
                deletedAt: new Date(),
            },
        });
    }
}