import { Prisma, PrismaClient, VerificationToken } from "@prisma/client";
import { prisma } from "../../../lib/prisma.js";

export class VerificationTokenRepository {
    constructor(
        private readonly db:
            | PrismaClient
            | Prisma.TransactionClient = prisma,
    ) {}

    async create(data: {
        tokenHash: string,
        userId: string,
        expiresAt: Date,
    }) : Promise<VerificationToken> {
        return this.db.verificationToken.create({
            data,
        });
    }

    async findByHash(
        tokenHash: string,
    ) : Promise<VerificationToken | null> {
        return this.db.verificationToken.findUnique({
            where: {
                tokenHash,
            },
        });
    }

    async markAsUsed(
        verificationTokenId: string,
    ) : Promise<VerificationToken> {
        return this.db.verificationToken.update({
            where: {
                id: verificationTokenId,
            },
            data: {
                usedAt: new Date(),
            },
        });
    }

    async delete(
        verificationTokenId: string,
    ) : Promise<VerificationToken> {
        return this.db.verificationToken.delete({
            where: {
                id: verificationTokenId,
            },
        });
    }

    async deleteExpired() : Promise<Prisma.BatchPayload> {
        return this.db.verificationToken.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
    }
}
