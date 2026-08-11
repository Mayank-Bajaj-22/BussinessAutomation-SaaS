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

    remove(
        membershipId: string,
    ) : Promise<Membership>;

    suspend(
        membershipId: string,
    ) : Promise<
        Membership & {
            user: User,
        }
    >;

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

    activate(
        membershipId: string,
    ) : Promise<
        Membership & {
            user: User;
        }
    >;

    activateInvitation(
        membershipId: string,
    ) : Promise<
        Membership & {
            user: User;
        }
    >;

    rejectInvitation(
        membershipId: string,
    ) : Promise<Membership>;

    reInvite(
        membershipId: string,
        role: MembershipRole,
        invitedById: string,
    ) : Promise<Membership>;

    findManyWithUsersByOrganization(
        organizationId: string,
    ) : Promise<
        (
            Membership & {
                user: User;
            }
        )[]
    >;

    findMemberWithUser(
        membershipId: string,
    ) : Promise<
        (
            Membership & {
                user: User,
            }
        ) | null
    >;

    changeMemberRole(
        membershipId: string,
        role: MembershipRole,
    ) : Promise<
        Membership & {
            user: User,
        }
    >;

    cancelInvitation(
        membershipId: string,
    ) : Promise<Membership>;

    updateRoleWithUser(
        membershipId: string,
        role: MembershipRole,
    ) : Promise<
        Membership & {
            user: User;
        }
    >;
}