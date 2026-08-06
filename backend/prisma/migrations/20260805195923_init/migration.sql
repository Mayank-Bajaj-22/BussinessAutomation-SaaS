/*
  Warnings:

  - A unique constraint covering the columns `[membershipId]` on the table `MembershipInvitationToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MembershipInvitationToken_membershipId_key" ON "MembershipInvitationToken"("membershipId");
