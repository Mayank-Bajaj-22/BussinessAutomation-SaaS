import { Membership, MembershipRole, Organization, Prisma, User } from "@prisma/client";
import { MembershipWithOrganization } from "../../common/types/index.js";

export interface IMembershipRepository {
    findById(
        membershipId: string,
    ) : Promise<Membership | null>;

    findByUserAndOrganization(
        userId: string,
        organizationId: string,
    ) : Promise<Membership | null>;

    findManyByOrganization(
        organizationId: string,
    ) : Promise<Membership[]>;

    create(
        data: Prisma.MembershipCreateInput,
    ) : Promise<Membership>;

    update(
        membershipId: string,
        data: Prisma.MembershipUpdateInput,
    ) : Promise<Membership>;

    changeRole(
        membershipId: string,
        role: MembershipRole,
    ) : Promise<Membership>;

    remove(
        membershipId: string,
    ) : Promise<Membership>;

    suspend(
        membershipId: string,
    ) : Promise<Membership>;

    findActiveMembershipWithOrganization(
        userId: string,
        organizationId?: string,
    ) : Promise<
        (
            Membership & {
                user: User;
                organization: Organization;
            }
        ) | null
    >;

    activateInvitation(
        membershipId: string,
    ) : Promise<Membership>;

    rejectInvitation(
        membershipId: string,
    ) : Promise<Membership>;

    reInvite(
        membershipId: string,
        role: MembershipRole,
        invitedById: string,
    ) : Promise<Membership>;    
}