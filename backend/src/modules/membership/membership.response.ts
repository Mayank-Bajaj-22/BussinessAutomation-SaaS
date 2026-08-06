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