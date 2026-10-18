-- AlterTable
ALTER TABLE "services" ADD CONSTRAINT "services_pkey" PRIMARY KEY ("id");

-- DropIndex
DROP INDEX "services_id_key";
