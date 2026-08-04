import { Membership } from "@prisma/client";
import { InviteMemberResponse } from "./membership.response.js";

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