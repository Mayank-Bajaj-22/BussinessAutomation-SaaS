import { Membership, MembershipInvitationToken, Organization, Prisma, PrismaClient, User } from "@prisma/client";
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
        return this.db.membershipInvitationToken.findUnique({
            where: {
                membershipId,
            },
        });
    }

    async findByTokenHash(
        tokenHash: string
    ): Promise<MembershipInvitationToken & {
        membership: Membership & {
            user: User,
            organization: Organization,
        },
    } | null> {
        return this.db.membershipInvitationToken.findUnique({
            where: {
                tokenHash,
                usedAt: null,
            },
            include: {
                membership: {
                    include: {
                        user: true,
                        organization: true,
                    },
                },
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

    async refreshInvitation(
        membershipId: string, 
        tokenHash: string, 
        invitedEmail: string,
        expiresAt: Date
    ): Promise<MembershipInvitationToken> {
        return this.db.membershipInvitationToken.update({
            where: {
                membershipId,
            },
            data: {
                tokenHash,
                expiresAt,
                invitedEmail,
                usedAt: null,
            },
        });
    }
}