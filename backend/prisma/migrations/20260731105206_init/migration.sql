/*
  Warnings:

  - You are about to drop the column `timezone` on the `Organization` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('INR', 'USD', 'EUR');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('hi', 'en', 'fr');

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "timezone";

-- CreateTable
CREATE TABLE "OrganizationSettings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationWorkingHour" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OrganizationWorkingHour_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationSettings_organizationId_key" ON "OrganizationSettings"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationWorkingHour_organizationId_idx" ON "OrganizationWorkingHour"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationWorkingHour_organizationId_dayOfWeek_key" ON "OrganizationWorkingHour"("organizationId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "OrganizationSettings" ADD CONSTRAINT "OrganizationSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationWorkingHour" ADD CONSTRAINT "OrganizationWorkingHour_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
