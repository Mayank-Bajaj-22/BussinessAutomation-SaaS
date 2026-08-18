import { AuditLog, Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { IAuditRepository } from "./audit.repository.interface.js";

export class AuditRepository implements IAuditRepository {
    constructor(
        private readonly db:
            PrismaClient |
            Prisma.TransactionClient = prisma,
    ) {}

    async create(
        data: Prisma.AuditLogUncheckedCreateInput
    ) : Promise<AuditLog> {
        return this.db.auditLog.create({ data });
    }
}