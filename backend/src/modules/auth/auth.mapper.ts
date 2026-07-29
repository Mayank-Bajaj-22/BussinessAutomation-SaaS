import { Membership, Organization, User } from "@prisma/client";
import { AuthResponseDTO, MembershipResponseDTO, OrganizationResponseDTO, UserResponseDTO } from "./auth.response.js";

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

export const toOrganizationResponse = (
    organization: Organization,
) : OrganizationResponseDTO => {
    return {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        timezone: organization.timezone,
        address: organization.address,
        status: organization.status,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
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
