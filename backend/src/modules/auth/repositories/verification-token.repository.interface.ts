import { Prisma, VerificationToken } from "@prisma/client";

export interface IVerificationTokenRepository {
    create(data: {
        tokenHash: string,
        userId: string,
        expiresAt: Date,
    }) : Promise<VerificationToken>;

    findByHash(
        tokenHash: string,
    ) : Promise<VerificationToken | null>;

    markAsUsed(
        verificationTokenId: string,
    ) : Promise<VerificationToken>;

    delete(
        verificationTokenId: string,
    ) : Promise<VerificationToken>;

    deleteExpired() : Promise<Prisma.BatchPayload>;
}