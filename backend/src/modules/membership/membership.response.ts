export interface InviteMemberResponse {
    membershipId: string;
    email: string;
    role: string;
    status: string;
    invitedAt: Date;
}

export interface AcceptInvitationResponse {
    membershipId: string;
    organizationId: string;
    role: string;
    status: string;
    joinedAt: Date;
}

export interface RejectInvitationResponse {
    membershipId: string;
    organizationId: string;
    role: string;
    status: string;
    joinedAt: Date;
}

export interface MemberResponse {
    membershipId: string;
    userId: string;

    name: string;
    email: string;
    avatarUrl?: string | null;

    role: string;
    status: string;

    joinedAt: Date;
}

export interface MembersResponse {
    members: MemberResponse[];
}

export interface ChangeMemberRoleResponse {
    membershipId: string;
    userId: string;

    name: string;
    email: string;
    avatarUrl?: string | null;

    role: string;
    status: string;

    joinedAt: Date;
}

export interface SuspendMemberResponse {
    membershipId: string;
    userId: string;

    name: string;
    email: string;
    avatarUrl?: string | null;

    role: string;
    status: string;

    joinedAt: Date;
}

export interface ActivateMemberResponse {
    membershipId: string;
    userId: string;

    name: string;
    email: string;
    avatarUrl?: string | null;

    role: string;
    status: string;

    joinedAt: Date;
}

export interface RemoveMemberResponse {
    membershipId: string;
    userId: string;
    removed: boolean;
}

export interface CancelInvitationResponse {
    membershipId: string;
    cancelled: boolean;
}