-- DropIndex
DROP INDEX "services_organizationId_key";

-- CreateIndex
CREATE INDEX "services_organizationId_idx" ON "services"("organizationId");
