import { MembershipStatus, OrganizationStatus, UserStatus } from "@prisma/client";
import { OrganizationResponseDTO } from "../organization/organization.response.js";

export interface UserResponseDTO {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    isEmailVerified: boolean;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthResponseDTO {
    user: UserResponseDTO;
    organization: OrganizationResponseDTO;
    membership: MembershipResponseDTO;
}

export interface MembershipResponseDTO {
    id: string;
    role: string;
    status: MembershipStatus;
    joinedAt: Date;
}

export interface SessionResponseDTO {
    sessionId: string;
    deviceName: string,
    ipAddress: string;
    userAgent: string;
    lastUsedAt: Date,
    createdAt: Date;
    isCurrent: boolean;
}

export interface SessionsResponseDTO {
    sessions: SessionResponseDTO[];
}