import { Membership, MembershipStatus, Organization, OrganizationStatus, UserStatus } from "@prisma/client";
import { IMembershipRepository } from "./membership.repository.interface.js";
import { AcceptInvitationDTO, InviteMemberDto, RejectInvitationDTO } from "./membership.schema.js";
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
import { toAcceptInvitationResponse, toInviteMemberResponse, toRejectInvitationResponse } from "./membership.mapper.js";

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

        if (membership?.status === MembershipStatus.ACTIVE) {
            throw new AppError(
                "User is already a member of this organization.",
                409,
            );
        }

        if (membership?.status === MembershipStatus.SUSPENDED) {
            throw new AppError(
                "Membership is suspended.",
                403,
            );
        }

        if (membership?.status === MembershipStatus.INVITED) {
            const invitation =
                await this.membershipInvitationRepo.findByMembershipId(
                    membership.id,
                );

            if (!invitation) {
                throw new AppError(
                    "Invitation token not found.",
                    500,
                );
            }

            const expired =
                invitation.expiresAt.getTime() < Date.now();

            if (!expired) {
                throw new AppError(
                    "Invitation has already been sent.",
                    409,
                );
            }
        }

        const invitationToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = hashToken(invitationToken);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        let createdMembership: Membership;

        if (!membership) {
            createdMembership = await prisma.$transaction(async (tx) => {
                const membershipRepo = new MembershipRepository(tx);
                const invitationRepo = new MembershipInvitationRepository(tx);

                const created = await membershipRepo.create({
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
                            id: created.id,
                        },
                    },
                });

                return created;
            });
        } else if (membership.status === MembershipStatus.INVITED) {
            createdMembership = await prisma.$transaction(async (tx) => {
                const invitationRepo = new MembershipInvitationRepository(tx);

                await invitationRepo.refreshInvitation(
                    membership.id,
                    tokenHash,
                    user.email,
                    expiresAt,
                );

                return membership;
            });
        } else if (membership.status === MembershipStatus.REJECTED) {
            createdMembership = await prisma.$transaction(async (tx) => {
                const membershipRepo = new MembershipRepository(tx);
                const invitationRepo = new MembershipInvitationRepository(tx);

                const updatedMembership = await membershipRepo.reInvite(
                    membership.id,
                    data.role,
                    inviterUserId,
                );

                await invitationRepo.refreshInvitation(
                    membership.id,
                    tokenHash,
                    user.email,
                    expiresAt,
                );

                return updatedMembership;
            })
        } else {
            throw new AppError(
                "Unable to invite member.",
                400,
            )
        }

        const invitationUrl = 
            `${APP_URL}/accept-invitation?token=${invitationToken}`;

        const inviter = await this.userRepo.findById(inviterUserId);

        if (!inviter) {
            throw new AppError(
                "Inviter not found",
                404,
            );
        }

        await emailQueue.add("membership-invitation", {
            type: "membership-invitation",
            to: user.email,
            data: {
                inviterName: inviter.name,
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

    async acceptInvitation(
        data: AcceptInvitationDTO,
    ) {
        const tokenHash = hashToken(data.token);

        const invitation = 
            await this.membershipInvitationRepo.findByTokenHash(
                tokenHash,
            );

        if (!invitation) {
            throw new AppError(
                "Invalid invitation token.",
                404, 
            );
        }

        if (invitation.usedAt) {
            throw new AppError(
                "Invitation has already been used.",
                409,
            );
        }

        if (invitation.expiresAt < new Date()) {
            throw new AppError(
                "Invitation has expired.",
                410,
            );
        }

        if (invitation.membership.status === MembershipStatus.ACTIVE) {
            throw new AppError(
                "Membership is already active.",
                409,
            );
        }

        if (invitation.membership.status === MembershipStatus.REJECTED) {
            throw new AppError(
                "Invitation has already been rejected.",
                409,
            );
        }

        if (invitation.membership.status === MembershipStatus.SUSPENDED) {
            throw new AppError(
                "Membership has been suspended.",
                403,
            );
        }

        const membership = await prisma.$transaction(async (tx) => {
            const membershipRepo = new MembershipRepository(tx);
            const invitationRepo = new MembershipInvitationRepository(tx);

            const updatedMembership = await membershipRepo.activateInvitation(
                invitation.membership.id,
            );

            await invitationRepo.markAsUsed(
                invitation.id,
            );

            return updatedMembership;
        });

        return toAcceptInvitationResponse(
            membership,
        )
    }

    async rejectInvitation(
        data: RejectInvitationDTO,
    ) {
        const tokenHash = hashToken(data.token);

        const invitation = await this.membershipInvitationRepo.findByTokenHash(
            tokenHash,
        );

        if (!invitation) {
            throw new AppError(
                "Invalid invitation token.",
                404,
            );
        }

        if (invitation.usedAt) {
            throw new AppError(
                "Invitation has already been processed.",
                409,
            );
        }

        if (invitation.expiresAt < new Date()) {
            throw new AppError(
                "Invitation has expired.",
                410,
            );
        }

        if (invitation.membership.status === MembershipStatus.ACTIVE) {
            throw new AppError(
                "Membership is already active",
                409,
            )
        }

        if (invitation.membership.status === MembershipStatus.REJECTED) {
            throw new AppError(
                "Invitation has already been rejected.",
                409,
            );
        }

        const membership = await prisma.$transaction(async (tx) => {
            const membershipRepo = new MembershipRepository(tx);
            const invitationRepo = new MembershipInvitationRepository(tx);

            const updatedMembership = await membershipRepo.rejectInvitation(
                invitation.membership.id,
            );

            await invitationRepo.markAsUsed(
                invitation.id,
            );

            return updatedMembership;
        })

        return toRejectInvitationResponse(
            membership,
        );
    }
}