/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumberId]` on the table `WhatsAppAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppAccount_phoneNumberId_key" ON "WhatsAppAccount"("phoneNumberId");
