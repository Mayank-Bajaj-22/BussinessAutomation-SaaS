import { Membership } from "@prisma/client";
import { AcceptInvitationResponse, InviteMemberResponse, RejectInvitationResponse } from "./membership.response.js";

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