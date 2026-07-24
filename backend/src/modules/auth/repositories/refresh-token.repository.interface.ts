import { Prisma, RefreshToken } from "@prisma/client";

export interface IRefreshTokenRepository {
    create(data: {
        tokenHash: string;
        userId: string;
        expiresAt: Date;
        deviceName: string;
        ipAddress: string;
        userAgent: string;
        sessionId: string;
        lastUsedAt: Date;
        isCurrent?: boolean;
    }) : Promise<RefreshToken>;

    findByHash(
        tokenHash: string,
    ) : Promise<RefreshToken | null>;

    revoke(
        refreshTokenId: string,
    ) : Promise<RefreshToken>;

    revokeAll(
        userId: string,
    ) : Promise<Prisma.BatchPayload>;

    markAsCurrent(
        refreshTokenId: string,
    ) : Promise<RefreshToken>;

    delete(
        refreshTokenId: string,
    ) : Promise<RefreshToken>;

    deleteExpired() : Promise<Prisma.BatchPayload>;

    updateLastUsed(
        refreshTokenId: string,
    ) : Promise<RefreshToken>;
}