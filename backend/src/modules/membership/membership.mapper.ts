import { Membership, User } from "@prisma/client";
import { AcceptInvitationResponse, ActivateMemberResponse, CancelInvitationResponse, ChangeMemberRoleResponse, InviteMemberResponse, MemberResponse, MembersResponse, RejectInvitationResponse, RemoveMemberResponse, SuspendMemberResponse } from "./membership.response.js";

export const toInviteMemberResponse = (
    membership: Membership,
    email: string,
) : InviteMemberResponse => {
    return {
        membershipId: membership.id,
        email,
        role: membership.role,
        status: membership.status,
        invitedAt: membership.createdAt,
    }
}

export const toAcceptInvitationResponse = (
    membership: Membership,
) : AcceptInvitationResponse => {
    return {
        membershipId: membership.id,
        organizationId: membership.organizationId,
        role: membership.role,
        status: membership.status,
        joinedAt: membership.joinedAt,
    }
}

export const toRejectInvitationResponse = (
    membership: Membership,
) : RejectInvitationResponse => {
    return {
        membershipId: membership.id,
        organizationId: membership.organizationId,
        role: membership.role,
        status: membership.status,
        joinedAt: membership.joinedAt,
    }
}

export const toMemberResponse = (
    membership: Membership & {
        user: User,
    },
) : MemberResponse => {
    return {
        membershipId: membership.id,
        userId: membership.user.id,

        name: membership.user.name,
        email: membership.user.email,
        avatarUrl: membership.user.avatarUrl,

        role: membership.role,
        status: membership.status,

        joinedAt: membership.joinedAt,
    };
};

export const toMembersResponse = (
    memberships: (
        Membership & {
            user: User;
        }
    )[],
): MembersResponse => {
    return {
        members: memberships.map(
            toMemberResponse,
        ),
    };
};

export const toChangeMemberRoleResponse = (
    membership: Membership & {
        user: User,
    },
) : ChangeMemberRoleResponse => {
    return {
        membershipId: membership.id,
        userId: membership.user.id,

        name: membership.user.name,
        email: membership.user.email,
        avatarUrl: membership.user.avatarUrl,

        role: membership.role,
        status: membership.status,

        joinedAt: membership.joinedAt,
    };
};

export const toSuspendResponse = (
    membership: Membership & {
        user: User,
    },
) : SuspendMemberResponse => {
    return {
        membershipId: membership.id,
        userId: membership.user.id,

        name: membership.user.name,
        email: membership.user.email,
        avatarUrl: membership.user.avatarUrl,

        role: membership.role,
        status: membership.status,

        joinedAt: membership.joinedAt,
    };
};

export const toActivateMemberResponse = (
    membership: Membership & {
        user: User,
    },
) : ActivateMemberResponse => {
    return {
        membershipId: membership.id,
        userId: membership.user.id,

        name: membership.user.name,
        email: membership.user.email,
        avatarUrl: membership.user.avatarUrl,

        role: membership.role,
        status: membership.status,

        joinedAt: membership.joinedAt,
    };
};

export const toRemoveMemberResponse = (
    membership: Membership,
) : RemoveMemberResponse => {
    return {
        membershipId: membership.id,
        userId: membership.userId,
        removed: true,
    };
};

export const toCancelInvitationResponse = (
    membership: Membership,
) : CancelInvitationResponse => {
    return {
        membershipId: membership.id,
        cancelled: true,
    }
}