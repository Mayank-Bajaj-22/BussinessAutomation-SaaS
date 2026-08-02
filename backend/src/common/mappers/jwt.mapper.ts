import { Membership, Organization, User } from "@prisma/client"
import { IJwtPayload } from "../types/index.js"

export const toJwtPayload = (
    user: User,
    organization: Organization,
    membership: Membership,
) : IJwtPayload => {
    return {
        userId: user.id,
        organizationId: organization.id,
        membershipRole: membership.role,
        membershipId: membership.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
    }
}