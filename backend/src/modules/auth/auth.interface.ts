import { Membership, Organization, PasswordResetToken, Prisma, RefreshToken, User, VerificationToken } from "@prisma/client";

export interface IRegisterUserData {
    name: string;
    email: string;
    password: string;
    organizationName: string;
    timezone: string;
}

export interface IAuthRepository {
    getUserById(userId: string) : Promise<User | null>;
    getUserByEmail(email: string) : Promise<User | null>;
    createUserWithOrganization(
        data: IRegisterUserData,
        passwordHash: string,
        organizationSlug: string,
    ) : Promise<{
        user: User;
        organization: Organization;
        membership: Membership;
    }>;
    createRefreshToken(data: {
        tokenHash: string;
        userId: string;
        expiresAt: string;
        ipAddress?: string | null;
        userAgent?: string | null;
        deviceName?: string | null;
    }) : Promise<RefreshToken>;
    findRefreshTokenByHash(tokenHash: string) : Promise<RefreshToken | null>;
    revokeRefreshToken(refreshTokenId: string) : Promise<Prisma.BatchPayload>;
    revokeAllRefreshTokens(userId: string) : Promise<Prisma.BatchPayload>;
    createVerificationToken(data: {
        tokenHash: string;
        userId: string;
        expiresAt: Date;
    }) : Promise<VerificationToken>;
    findVerificationToken(tokenHash: string) : Promise<VerificationToken | null>;
    deleteVerificationToken(verificationTokenId: string) : Promise<VerificationToken>;
    createPasswordResetToken(data: {
        tokenHash: string;
        userId: string;
        expiresAt: Date;
    }) : Promise<PasswordResetToken>;
    findPasswordResetToken(tokenHash: string) : Promise<PasswordResetToken | null>;
    deletePasswordResetToken(passwordResetTokenId: string) : Promise<PasswordResetToken>;
    verifyUserEmail(userId: string) : Promise<User>;
}