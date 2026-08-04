import { MembershipStatus, Organization, OrganizationStatus, UserStatus } from "@prisma/client";
import { IMembershipRepository } from "./membership.repository.interface.js";
import { InviteMemberDto } from "./membership.schema.js";
import { IMembershipInvitationRepository } from "../membership-invitation/membership-invitation.repository.interface.js";
import { IUserRepository } from "../user/user.repository.interface.js";
import { AppError } from "../../common/errors/AppError.js";
import { prisma } from "../../lib/prisma.js";
import { MembershipRepository } from "./membership.repository.js";
import { MembershipInvitationRepository } from "../membership-invitation/membership-invitation.repository.js";
import crypto from "crypto";
import { hashToken } from "../../lib/bcrypt.js";
import { APP_URL } from "../../config/env.config.js";
import { emailQueue } from "../../jobs/queues/email.queue.js";
import { toInviteMemberResponse } from "./membership.mapper.js";

export class MembershipService {
    constructor(
        private readonly membershipRepo: IMembershipRepository, 
        private readonly membershipInvitationRepo: IMembershipInvitationRepository,
        private readonly userRepo: IUserRepository,
    ) {}

    async inviteMember(
        inviterUserId: string,
        organization: Organization,
        data: InviteMemberDto,
    ) {
        const user = await this.userRepo.findByEmail(data.email);

        if (!user) {
            throw new AppError(
                "User not found",
                404,
            );
        }

        if (user.deletedAt) {
            throw new AppError(
                "User has been deleted,",
                400,
            );
        }

        if (user.status === UserStatus.INACTIVE || user.status === UserStatus.SUSPENDED) {
            throw new AppError(
                "User is inactive or suspended.",
                400,
            );
        }

        if (!user.isEmailVerified) {
            throw new AppError(
                "User email is not verified.",
                400,
            );
        }

        if (user.id === inviterUserId) {
            throw new AppError(
                "You cannot invite yourself.",
                400,
            );
        }

        if (organization.deletedAt) {
            throw new AppError(
                "Organization has been deleted.",
                400,
            );
        }

        if (organization.status !== OrganizationStatus.ACTIVE) {
            throw new AppError(
                "Organization is inactive.",
                400,
            );
        }

        const membership = 
            await this.membershipRepo.findByUserAndOrganization(
                user.id,
                organization.id,
            );

        if (membership && membership.status !== MembershipStatus.INVITED) {
            throw new AppError(
                "User is already a member of this organization.",
                409,
            );
        }

        if (membership && membership.status === MembershipStatus.INVITED) {
            throw new AppError(
                "Invitation has already been sent.",
                409,
            );
        }

        const invitationToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = hashToken(invitationToken);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const createdMembership = await prisma.$transaction(async (tx) => {
            const membershipRepo = new MembershipRepository(tx);
            const invitationRepo = new MembershipInvitationRepository(tx);

            const membership = await membershipRepo.create({
                role: data.role,
                status: MembershipStatus.INVITED,
                invitedBy: {
                    connect: {
                        id: inviterUserId,
                    },
                },
                user: {
                    connect: {
                        id: user.id,
                    },
                },
                organization: {
                    connect: {
                        id: organization.id,
                    },
                }
            });

            await invitationRepo.create({
                tokenHash,
                invitedEmail: user.email,
                expiresAt,
                membership: {
                    connect: {
                        id: membership.id,
                    },
                },
            });

            return membership;
        });

        const invitationUrl = 
            `${APP_URL}/accept-invitation?token=${invitationToken}`;

        const inviter = await this.userRepo.findById(inviterUserId);

        await emailQueue.add("membership-invitation", {
            type: "membership-invitation",
            to: user.email,
            data: {
                inviterName: inviter!.name,
                organizationName: organization.name,
                invitationUrl,
                role: data.role,
            },
        });

        return toInviteMemberResponse(
            createdMembership,
            user.email,
        );
    }
}