-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_services" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "staff_organizationId_isActive_idx" ON "staff"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "staff_organizationId_name_idx" ON "staff"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "staff_organizationId_email_key" ON "staff"("organizationId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "staff_organizationId_phone_key" ON "staff"("organizationId", "phone");

-- CreateIndex
CREATE INDEX "staff_services_serviceId_idx" ON "staff_services"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "staff_services_staffId_serviceId_key" ON "staff_services"("staffId", "serviceId");

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_services" ADD CONSTRAINT "staff_services_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_services" ADD CONSTRAINT "staff_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
