import { Membership, MembershipRole, MembershipStatus, Organization, OrganizationStatus, UserStatus } from "@prisma/client";
import { IMembershipRepository } from "./membership.repository.interface.js";
import { AcceptInvitationDTO, ChangeMemberRoleDTO, InviteMemberDto, RejectInvitationDTO, TransferOwnershipDTO } from "./membership.schema.js";
import { IMembershipInvitationRepository } from "../membership-invitation/membership-invitation.repository.interface.js";
import { IUserRepository } from "../user/user.repository.interface.js";
import { AppError } from "../../common/errors/AppError.js";
import { prisma } from "../../lib/prisma.js";
import { MembershipRepository } from "./membership.repository.js";
import { MembershipInvitationRepository } from "../membership-invitation/membership-invitation.repository.js";
import crypto from "crypto";
import { hashToken } from "../../lib/bcrypt.js";
import { env } from "../../config/env.config.js";
import { emailQueue } from "../../jobs/queues/email.queue.js";
import { toAcceptInvitationResponse, toActivateMemberResponse, toCancelInvitationResponse, toChangeMemberRoleResponse, toInviteMemberResponse, toLeaveOrganizationResponse, toMemberResponse, toMembersResponse, toRejectInvitationResponse, toRemoveMemberResponse, toSuspendResponse, toTransferOwnershipResponse } from "./membership.mapper.js";

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
            `${env.APP_URL}/accept-invitation?token=${invitationToken}`;

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

            const updatedMembership = await membershipRepo.activate(
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

    async getAllMembers(
        organization: Organization,
    ) {
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

        const memberships = await this.membershipRepo.findManyWithUsersByOrganization(
            organization.id,
        );

        return toMembersResponse(
            memberships,
        );
    }

    async getMemberById(
        organization: Organization,
        membershipId: string,
    ) {
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

        const membership = await this.membershipRepo.findMemberWithUser(
            membershipId,
        );

        if (!membership) {
            throw new AppError(
                "Member not found.",
                404,
            );
        }

        if (membership.organizationId !== organization.id) {
            throw new AppError(
                "Member not found.",
                404,
            );
        }

        return toMemberResponse(
            membership,
        );
    }

    async changeMemberRole(
        data: ChangeMemberRoleDTO,
        currentMembershipId: string,
        organization: Organization,
        targetMembershipId: string,
    ) {
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

        const targetMembership = await this.membershipRepo.findMemberWithUser(
            targetMembershipId,
        );

        if (!targetMembership) {
            throw new AppError(
                "Member not found.",
                404,
            );
        }

        if (
            targetMembership.organizationId !==
            organization.id
        ) {
            throw new AppError(
                "Member not found.",
                404,
            );
        }

        if (targetMembership.id === currentMembershipId) {
            throw new AppError(
                "You cannot change your own role.",
                409,
            );
        }

        if (targetMembership.role === MembershipRole.OWNER) {
            throw new AppError(
                "Owner role cannot be changed.",
                403,
            );
        }

        if (targetMembership.role === data.role) {
            throw new AppError(
                `Member is already ${data.role}.`,
                403,
            );
        }

        const currentMembership = await this.membershipRepo.findById(
            currentMembershipId,
        );

        if (!currentMembership) {
            throw new AppError(
                "Current membership not found.",
                404,
            );
        }

        if (currentMembership.role === MembershipRole.ADMIN) {
            if (targetMembership.role === MembershipRole.ADMIN) {
                throw new AppError(
                    "Admin cannot modify another Admin.",
                    403,
                );
            }
        }

        const updatedMembership = await this.membershipRepo.changeMemberRole(
            targetMembership.id,
            data.role,
        );

        return toChangeMemberRoleResponse(
            updatedMembership,
        );
    }

    async suspendMember(
        currentMembershipId: string,
        organization: Organization,
        targetMembershipId: string,
    ) {
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

        const targetMembership = 
            await this.membershipRepo.findMemberWithUser(targetMembershipId);

        if (!targetMembership) {
            throw new AppError(
                "Member not found.",
                404,
            );
        }

        if (targetMembership.organizationId !== organization.id) {
            throw new AppError(
                "Member not found.",
                404,
            );
        }

        if (targetMembership.id === currentMembershipId) {
            throw new AppError(
                "You cannot suspend yourself.",
                409,
            );
        }

        if (targetMembership.role === MembershipRole.OWNER) {
            throw new AppError(
                "Owner cannot be suspended.",
                403,
            );
        }

        if (targetMembership.status === MembershipStatus.INVITED) {
            throw new AppError(
                "Invited members cannot be suspended. Reject or cancel the invitation instead.",
                409,
            );
        }

        if (targetMembership.status === MembershipStatus.SUSPENDED) {
            throw new AppError(
                "Member is already suspended.",
                409,
            );
        }

        const currentMembership = 
            await this.membershipRepo.findById(currentMembershipId);

        if (!currentMembership) {
            throw new AppError(
                "Current membership not found.",
                404,
            );
        }

        if (currentMembership.role === MembershipRole.ADMIN) {
            if (targetMembership.role === MembershipRole.ADMIN) {
                throw new AppError(
                    "Admin cannot suspend another Admin.",
                    403,
                );
            }
        }

        const suspendMembership = 
            await this.membershipRepo.suspend(
                targetMembership.id,
            );

        return toSuspendResponse(
            suspendMembership,
        );
    }

    async activateMember(
        currentMembershipId: string,
        organization: Organization,
        targetMembershipId: string,
    ) {
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

        const targetMembership =
            await this.membershipRepo.findMemberWithUser(
                targetMembershipId,
            );

        if (!targetMembership) {
            throw new AppError(
                "Member not found.",
                404,
            );
        }

        if (targetMembership.id !== organization.id) {
            throw new AppError(
                "Member not found.",
                404,
            );
        }

        if (targetMembership.id === currentMembershipId) {
            throw new AppError(
                "You cannot activate yourself.",
                409,
            );
        }

        if (targetMembership.role === MembershipRole.OWNER) {
            throw new AppError(
                "Owner is already active.",
                409,
            );
        }

        if (targetMembership.status === MembershipStatus.ACTIVE) {
            throw new AppError(
                "Member is already active.",
                409,
            );
        }

        if (targetMembership.status === MembershipStatus.INVITED) {
            throw new AppError(
                "Invited members cannot be activated. Accept the invitation first.",
                409,
            );
        }

        if (targetMembership.status === MembershipStatus.REJECTED) {
            throw new AppError(
                "Rejected members cannot be activated. Re-invite the member first.",
                409,
            );
        }

        const currentMembership =
            await this.membershipRepo.findById(
                currentMembershipId,
            );

        if (!currentMembership) {
            throw new AppError(
                "Current membership not found.",
                404,
            );
        }

        if (currentMembership.role === MembershipRole.ADMIN) {
            if (
                targetMembership.role ===
                MembershipRole.ADMIN
            ) {
                throw new AppError(
                    "Admin cannot activate another Admin.",
                    403,
                );
            }
        }

        const activatemembership = 
            await this.membershipRepo.activateInvitation(
                targetMembership.id,
            );

        return toActivateMemberResponse(
            activatemembership,
        );
    }

    async removeMember(
        currentMembershipId: string,
        organization: Organization,
        targetMembershipId: string,
    ) {
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

        const targetMembership =
            await this.membershipRepo.findMemberWithUser(
                targetMembershipId,
            );

        if (!targetMembership) {
            throw new AppError(
                "Member not found.",
                404,
            );
        }

        if (targetMembership.id !== organization.id) {
            throw new AppError(
                "Member not found.",
                404,
            );
        }

        if (targetMembership.id === currentMembershipId) {
            throw new AppError(
                "You cannot remove yourself from the organization.",
                409,
            );
        }

        if (targetMembership.role === MembershipRole.OWNER) {
            throw new AppError(
                "Owner cannot be removed.",
                403,
            );
        }

        if (targetMembership.status === MembershipStatus.INVITED) {
            throw new AppError(
                "Pending invitations cannot be removed. Cancel the invitation instead.",
                409,
            );
        }

        const currentMembership =
            await this.membershipRepo.findById(
                currentMembershipId,
            );

        if (!currentMembership) {
            throw new AppError(
                "Current membership not found.",
                404,
            );
        }

        if (currentMembership.role === MembershipRole.ADMIN) {
            if (targetMembership.role === MembershipRole.ADMIN) {
                throw new AppError(
                    "Admin cannot remove another Admin.",
                    403,
                );
            }
        }

        const removedMembership =
            await this.membershipRepo.remove(
                targetMembership.id,
            );

        return toRemoveMemberResponse(
            removedMembership,
        );
    }

    async cancelInvitation(
        currentMembershipId: string,
        organization: Organization,
        targetMembershipId: string,
    ) {
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

        const targetMembership =
            await this.membershipRepo.findMemberWithUser(
                targetMembershipId,
            );

        if (!targetMembership) {
            throw new AppError(
                "Member not found.",
                404,
            );
        }

        if (targetMembership.organizationId !== organization.id) {
            throw new AppError(
                "Member not found.",
                404,
            );
        }

        if (targetMembership.id === currentMembershipId) {
            throw new AppError(
                "You cannot cancel your own invitation.",
                409,
            );
        }

        const currentMembership = 
            await this.membershipRepo.cancelInvitation(
                currentMembershipId,
            );

        if (!currentMembership) {
            throw new AppError(
                "Current membership not found.",
                404,
            );
        }

        if (
            currentMembership.role !== MembershipRole.OWNER &&
            currentMembership.role !== MembershipRole.ADMIN
        ) {
            throw new AppError(
                "You don't have permission to cancel invitations.",
                403,
            );
        }

        if (
            currentMembership.role === MembershipRole.ADMIN &&
            targetMembership.role === MembershipRole.ADMIN
        ) {
            throw new AppError(
                "Admin cannot cancel another Admin's invitation.",
                403,
            );
        }

        if (targetMembership.status !== MembershipStatus.INVITED) {
            throw new AppError(
                "This member does not have a pending invitation.",
                409,
            );
        }

        const invitation =
            await this.membershipInvitationRepo.findByMembershipId(
                targetMembership.id,
            );

        if (!invitation) {
            throw new AppError(
                "Invitation token not found.",
                404,
            );
        }

        if (invitation.usedAt) {
            throw new AppError(
                "Invitation has already been processed.",
                409,
            );
        }

        const cancelledMembership = 
            await prisma.$transaction(async (tx) => {
                const membershipRepo = new MembershipRepository(tx);
                const invitationRepo = new MembershipInvitationRepository(tx);

                const updatedMembership = 
                    await membershipRepo.cancelInvitation(
                        targetMembership.id,
                    );

                await invitationRepo.markAsUsed(
                    invitation.id,
                );

                return updatedMembership;
            });

        return toCancelInvitationResponse(
            cancelledMembership,
        );
    }

    async tranferOwnership(
        currentMembershipId: string,
        organization: Organization,
        data: TransferOwnershipDTO,
    ) {
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

        const currentMembership =
            await this.membershipRepo.findMemberWithUser(
                currentMembershipId,
            );

        if (!currentMembership) {
            throw new AppError(
                "Current membership not found.",
                404,
            );
        }

        if (currentMembership.role !== MembershipRole.OWNER) {
            throw new AppError(
                "Only the owner can transfer ownership.",
                403,
            );
        }

        if (currentMembership.id === data.membershipId) {
            throw new AppError(
                "You cannot transfer ownership to yourself.",
                409,
            );
        }

        const targetMembership = 
            await this.membershipRepo.findMemberWithUser(
                data.membershipId,
            );

        if (!targetMembership) {
            throw new AppError(
                "Target member not found.",
                404,
            );
        }

        if (targetMembership.organizationId !== organization.id) {
            throw new AppError(
                "Target member does not belong to this organization.",
                404,
            );
        }

        if (targetMembership.status !== MembershipStatus.ACTIVE) {
            throw new AppError(
                "Ownership can only be transferred to an active member.",
                409,
            );
        }

        if (targetMembership.role === MembershipRole.OWNER) {
            throw new AppError(
                "Target member is already the owner.",
                409,
            );
        }

        const result = await prisma.$transaction(async (tx) => {
            const membershipRepo = new MembershipRepository(tx);

            const previousOwner = await membershipRepo.updateRoleWithUser(
                currentMembership.id,
                MembershipRole.ADMIN,
            );

            const newOwner = await membershipRepo.updateRoleWithUser(
                targetMembership.id,
                MembershipRole.OWNER,
            );

            return {
                previousOwner,
                newOwner,
            };
        })

        return toTransferOwnershipResponse(
            result.previousOwner,
            result.newOwner,
        );
    }

    async LeaveOrganization(
        currentMembershipId: string,
        organization: Organization,
    ) {
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

        const currentMembership =
            await this.membershipRepo.findById(
                currentMembershipId,
            );

        if (!currentMembership) {
            throw new AppError(
                "Current membership not found.",
                404,
            );
        }

        if (currentMembership.organizationId !== organization.id) {
            throw new AppError(
                "Membership not found.",
                404,
            );
        }

        if (currentMembership.status !== MembershipStatus.ACTIVE) {
            throw new AppError(
                "Only active members can leave the organization.",
                409,
            );
        }

        if (currentMembership.role === MembershipRole.OWNER) {
            throw new AppError(
                "Owner cannot leave the organization. Transfer ownership first.",
                409,
            );
        }

        const removedMembership =
            await this.membershipRepo.remove(
                currentMembership.id,
            );

        return toLeaveOrganizationResponse(
            removedMembership,
        );
    }
}