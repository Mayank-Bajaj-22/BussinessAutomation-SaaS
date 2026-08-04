import { MembershipInvitationToken, Prisma } from "@prisma/client";

export interface IMembershipInvitationRepository {
    create(
        data: Prisma.MembershipInvitationTokenCreateInput,
    ) : Promise<MembershipInvitationToken>;

    findByMembershipId(
        membershipId: string,
    ) : Promise<MembershipInvitationToken | null>;

    findByTokenHash(
        tokenHash: string,
    ) : Promise<MembershipInvitationToken | null>;

    markAsUsed(
        tokenId: string,
    ) : Promise<MembershipInvitationToken>;
}