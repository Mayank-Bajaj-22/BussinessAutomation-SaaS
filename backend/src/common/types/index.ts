import { MembershipRole, Prisma } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";

export type ApiResponse<T> = {
    success: boolean;
    message: string;
    data?: T;
};

export interface IJwtPayload extends JwtPayload {
    userId: string;
    organizationId: string;
    membershipRole: MembershipRole;
    email: string;
    isEmailVerified: boolean;
}

export type MembershipWithOrganization = 
    Prisma.MembershipGetPayload<{
        include: {
            organization: true,
        }
    }>