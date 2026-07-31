/*
  Warnings:

  - Changed the type of `dayOfWeek` on the `OrganizationWorkingHour` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- AlterTable
ALTER TABLE "OrganizationWorkingHour" DROP COLUMN "dayOfWeek",
ADD COLUMN     "dayOfWeek" "DayOfWeek" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationWorkingHour_organizationId_dayOfWeek_key" ON "OrganizationWorkingHour"("organizationId", "dayOfWeek");
