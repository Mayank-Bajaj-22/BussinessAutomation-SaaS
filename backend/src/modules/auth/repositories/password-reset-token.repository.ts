import { PasswordResetToken, Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../../../lib/prisma.js";

export class PasswordResetTokenRepository {
    constructor(
        private readonly db:
            | PrismaClient
            | Prisma.TransactionClient = prisma,
    ) {}

    async create(data: {
        tokenHash: string;
        userId: string;
        expiresAt: Date;
    }): Promise<PasswordResetToken> {
        return this.db.passwordResetToken.create({
            data,
        });
    }

    async findByHash(
        tokenHash: string,
    ): Promise<PasswordResetToken | null> {
        return this.db.passwordResetToken.findUnique({
            where: {
                tokenHash,
            },
        });
    }

    async markAsUsed(
        passwordResetTokenId: string,
    ): Promise<PasswordResetToken> {
        return this.db.passwordResetToken.update({
            where: {
                id: passwordResetTokenId,
            },
            data: {
                usedAt: new Date(),
            },
        });
    }

    async delete(
        passwordResetTokenId: string,
    ): Promise<PasswordResetToken> {
        return this.db.passwordResetToken.delete({
            where: {
                id: passwordResetTokenId,
            },
        });
    }

    async deleteExpired(): Promise<Prisma.BatchPayload> {
        return this.db.passwordResetToken.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
    }

    async deleteByUserId(
        userId: string,
    ) : Promise<Prisma.BatchPayload> {
        return this.db.passwordResetToken.deleteMany({
            where: {
                userId,
            }
        });
    }
}