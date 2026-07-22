import { PasswordResetToken, Prisma } from "@prisma/client";

export interface IPasswordResetTokenRepository {
    create(data: {
        tokenHash: string;
        userId: string;
        expiresAt: Date;
    }) : Promise<PasswordResetToken>;

    findByHash(
        tokenHash: string,
    ): Promise<PasswordResetToken | null>;

    markAsUsed(
        passwordResetTokenId: string,
    ): Promise<PasswordResetToken>;

    delete(
        passwordResetTokenId: string,
    ): Promise<PasswordResetToken>;

    deleteExpired(): Promise<Prisma.BatchPayload>;
} 