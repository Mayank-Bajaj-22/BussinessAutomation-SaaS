import { MembershipInvitationToken, Prisma, PrismaClient } from "@prisma/client";
import { IMembershipInvitationRepository } from "./membership-invitation.repository.interface.js";
import { prisma } from "../../lib/prisma.js";

export class MembershipInvitationRepository implements IMembershipInvitationRepository {
    constructor (
        private readonly db: 
            | PrismaClient
            | Prisma.TransactionClient = prisma,
    ) {}

    async create(
        data: Prisma.MembershipInvitationTokenCreateInput
    ): Promise<MembershipInvitationToken> {
        return this.db.membershipInvitationToken.create({
            data,
        });
    }

    async findByMembershipId(
        membershipId: string
    ): Promise<MembershipInvitationToken | null> {
        return this.db.membershipInvitationToken.findFirst({
            where: {
                membershipId,
                usedAt: null,
            },
            orderBy: {
                createdAt: "asc",
            },
        });
    }

    async findByTokenHash(
        tokenHash: string
    ): Promise<MembershipInvitationToken | null> {
        return this.db.membershipInvitationToken.findUnique({
            where: {
                tokenHash,
            },
        });
    }

    async markAsUsed(
        tokenId: string
    ): Promise<MembershipInvitationToken> {
        return this.db.membershipInvitationToken.update({
            where: {
                id: tokenId,
            },
            data: {
                usedAt: new Date(),
            },
        });
    }
}