import { AuditAction, AuditResource, Prisma } from "@prisma/client";
import { AuditRepository } from "./audit.repository.js";

export class AuditService {
    constructor(
        private readonly auditRepo: AuditRepository,
    ) {}

    async create(
        params: {
            action: AuditAction;
            resource: AuditResource;
            userId?: string;
            organizationId?: string;
            resourceId?: string;
            ipAddress?: string;
            userAgent?: string;
            requestId?: string;
            metadata?: Prisma.InputJsonValue;
        }
    ) {
        return this.auditRepo.create({
            action: params.action,
            resource: params.resource,

            userId: params.userId,
            organizationId: params.organizationId,
            resourceId: params.resourceId,

            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
            requestId: params.requestId,

            metadata: params.metadata,
        })
    }
}