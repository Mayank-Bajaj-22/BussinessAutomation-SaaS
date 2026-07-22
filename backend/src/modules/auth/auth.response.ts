export interface UserResponseDTO {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    isEmailVerified: boolean;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthResponseDTO {
    user: UserResponseDTO;
    organization: OrganizationResponseDTO;
    membership: MembershipResponseDTO;
}

export interface OrganizationResponseDTO {
    id: string;
    name: string;
    slug: string;
    timezone: string;
    address: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface MembershipResponseDTO {
    id: string;
    role: string;
    status: string;
    joinedAt: Date;
}