import { Membership, MembershipInvitationToken, Organization, Prisma, User } from "@prisma/client";

export interface IMembershipInvitationRepository {
    create(
        data: Prisma.MembershipInvitationTokenCreateInput,
    ) : Promise<MembershipInvitationToken>;

    findByMembershipId(
        membershipId: string,
    ) : Promise<MembershipInvitationToken | null>;

    findByTokenHash(
        tokenHash: string,
    ) : Promise<MembershipInvitationToken & {
        membership: Membership & {
            user: User,
            organization: Organization,
        },
    } | null>;

    markAsUsed(
        tokenId: string,
    ) : Promise<MembershipInvitationToken>;

    refreshInvitation(
        membershipId: string,
        tokenHash: string,
        invitedEmail: string,
        expiresAt: Date,
    ) : Promise<MembershipInvitationToken>;
}