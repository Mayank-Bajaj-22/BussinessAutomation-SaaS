import { Membership, Organization, User } from "@prisma/client";
import { AuthResponseDTO, MembershipResponseDTO, UserResponseDTO } from "./auth.response.js";
import { toOrganizationResponse } from "../organization/organization.mapper.js";

export const toUserResponse = (
    user: User,
) : UserResponseDTO => {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }
}

export const toMembershipResponse = (
    membership: Membership,
) : MembershipResponseDTO => {
    return {
        id: membership.id,
        role: membership.role,
        status: membership.status,
        joinedAt: membership.joinedAt,
    }
}

export const toAuthResponse = (
    user: User,
    organization: Organization,
    membership: Membership,
) : AuthResponseDTO => {
    return {
        user: toUserResponse(user),

        organization: toOrganizationResponse(organization),

        membership: {
            id: membership.id,
            role: membership.role,
            status: membership.status,
            joinedAt: membership.joinedAt,
        }
    }
}
