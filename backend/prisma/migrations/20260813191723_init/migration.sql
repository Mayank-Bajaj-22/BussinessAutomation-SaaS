-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('USER_REGISTERED', 'USER_LOGGED_IN', 'USER_LOGGED_OUT', 'USER_LOGGED_OUT_ALL', 'USER_LOGGED_FAILED', 'EMAIL_VERIFIED', 'VERIFICATION_EMAIL_RESENT', 'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED', 'PASSWORD_CHANGED', 'SESSION_REVOKED', 'SESSIONS_REVOKED', 'ORGANIZATION_SWITCHED', 'ORGANIZATION_UPDATED', 'ORGANIZATION_DELETED', 'ORGANIZATION_SETTINGS_UPDATED', 'WORKING_HOURS_UPDATED', 'MEMBER_INVITED', 'MEMBER_INVITATION_ACCEPTED', 'MEMBER_INVITATION_REJECTED', 'MEMBER_INVITATION_CANCELLED', 'MEMBER_INVITATION_REINVITED', 'MEMBER_ROLE_CHANGED', 'MEMBER_SUSPENDED', 'MEMBER_ACTIVATED', 'MEMBER_REMOVED', 'OWNERSHIP_TRANSFERRED', 'ORGANIZATION_LEFT');

-- CreateEnum
CREATE TYPE "AuditResource" AS ENUM ('USER', 'ORGANIZATION', 'MEMBERSHIP', 'INVITATION', 'SESSION', 'ORGANIZATION_SETTINGS', 'WORKING_HOURS');

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "resource" "AuditResource" NOT NULL,
    "userId" TEXT,
    "organizationId" TEXT,
    "resourceId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "requestId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_idx" ON "AuditLog"("organizationId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_resource_idx" ON "AuditLog"("resource");

-- CreateIndex
CREATE INDEX "AuditLog_resourceId_idx" ON "AuditLog"("resourceId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
