import { Membership, MembershipRole, Prisma, PrismaClient } from "@prisma/client";
import { IMembershipRepository } from "./membership.repository.interface.js";
import { prisma } from "../../lib/prisma.js";

export class MembershipRepository implements IMembershipRepository {
    constructor(
        private readonly db: 
            | PrismaClient
            | Prisma.TransactionClient = prisma,
    ) {}

    async findById(membershipId: string): Promise<Membership | null> {
        return this.db.membership.findUnique({
            where: {
                id: membershipId,
            },
        });
    }

    async findByUserAndOrganization(userId: string, organizationId: string): Promise<Membership | null> {
        return this.db.membership.findUnique({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId,
                },
            },
        });
    }

    async findManyByOrganization(organizationId: string): Promise<Membership[]> {
        return this.db.membership.findMany({
            where: {
                organizationId,
            },
            orderBy: {
                createdAt: "asc",
            },
        });
    }

    async create(data: Prisma.MembershipCreateInput): Promise<Membership> {
        return this.db.membership.create({
            data,
        })
    }

    async update(membershipId: string, data: Prisma.MembershipUpdateInput): Promise<Membership> {
        return this.db.membership.update({
            where: {
                id: membershipId,
            },
            data,
        });
    }

    async changeRole(membershipId: string, role: MembershipRole): Promise<Membership> {
        return this.db.membership.update({
            where: {
                id: membershipId,
            },
            data: {
                role,
            },
        });
    }

    async remove(membershipId: string): Promise<Membership> {
        return this.db.membership.delete({
            where: {
                id: membershipId,
            },
        });
    }

    async suspend(membershipId: string): Promise<Membership> {
        return this.db.membership.update({
            where: {
                id: membershipId,
            },
            data: {
                status: "SUSPENDED",
            },
        });
    }

    async activate(membershipId: string): Promise<Membership> {
        return this.db.membership.update({
            where: {
                id: membershipId,
            },
            data: {
                status: "ACTIVE",
            },
        });
    }
}