import { AuditLog, Prisma } from "@prisma/client";

export interface IAuditRepository {
    create(
        data: Prisma.AuditLogUncheckedCreateInput,
    ) : Promise<AuditLog>;
}