export interface InviteMemberResponse {
    membershipId: string;
    email: string;
    role: string;
    status: string;
    invitedAt: Date;
}