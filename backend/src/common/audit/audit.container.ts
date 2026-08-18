import { AuditRepository } from "./audit.repository.js";
import { AuditService } from "./audit.service.js";

const auditRepository = new AuditRepository();
const auditService = new AuditService(
    auditRepository,
);

export { auditService };