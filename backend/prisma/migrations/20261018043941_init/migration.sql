/*
  Warnings:

  - A unique constraint covering the columns `[organizationId]` on the table `services` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "services_organizationId_isActive_key";

-- CreateIndex
CREATE UNIQUE INDEX "services_organizationId_key" ON "services"("organizationId");
