import { Prisma, PrismaClient, RefreshToken } from "@prisma/client";
import { prisma } from "../../../lib/prisma.js";

export class RefreshTokenRepository {
    constructor (
        private readonly db: 
            | PrismaClient
            | Prisma.TransactionClient = prisma,
    ) {}

    async create(data: {
        tokenHash: string;
        userId: string;
        expiresAt: Date;
        deviceName: string;
        ipAddress: string;
        userAgent: string;
        sessionId: string;
        lastUsedAt: Date;
        isCurrent?: boolean;
    }) : Promise<RefreshToken> {
        return this.db.refreshToken.create({
            data,
        });
    }

    async findByHash(
        tokenHash: string,
    ) : Promise<RefreshToken | null> {
        return this.db.refreshToken.findUnique({
            where: {
                tokenHash,
            },
        });
    }

    async revoke(
        refreshTokenId: string,
    ) : Promise<RefreshToken> {
        return this.db.refreshToken.update({
            where: {
                id: refreshTokenId,
                revokedAt: null,
            },
            data: {
                revokedAt: new Date(),
                isCurrent: false,
            },
        });
    }

    async revokeAll(
        userId: string,
    ) : Promise<Prisma.BatchPayload> {
        return this.db.refreshToken.updateMany({
            where: {
                userId,
                revokedAt: null,
            },
            data: {
                revokedAt: new Date(),
                isCurrent: false,
            },
        });
    }

    async markAsCurrent(
        refreshTokenId: string,
    ) : Promise<RefreshToken> {
        return this.db.refreshToken.update({
            where: {
                id: refreshTokenId,
            },
            data: {
                isCurrent: true,
                lastUsedAt: new Date(),
            },
        });
    }

    async delete(
        refreshTokenId: string,
    ) : Promise<RefreshToken> {
        return this.db.refreshToken.delete({
            where: {
                id: refreshTokenId,
            },
        });
    }

    async deleteExpired() : Promise<Prisma.BatchPayload> {
        return this.db.refreshToken.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
    }

    async updateLastUsed(
        refreshTokenId: string,
    ) : Promise<RefreshToken> {
        return this.db.refreshToken.update({
            where: {
                id: refreshTokenId,
            },
            data: {
                lastUsedAt: new Date(),
            }
        })
    }

    async findAllActiveByUserId(
        userId: string,
    ) : Promise<RefreshToken[]> {
        return this.db.refreshToken.findMany({
            where: {
                userId,
                revokedAt: null,
            },
            orderBy: {
                lastUsedAt: "desc",
            },
        });
    }

    async findBySessionId(
        sessionId: string,
    ): Promise<RefreshToken | null> {
        return this.db.refreshToken.findFirst({
            where: {
                sessionId,
            },
        });
    }
}