-- CreateTable
CREATE TABLE "MembershipInvitationToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "invitedEmail" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipInvitationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MembershipInvitationToken_tokenHash_key" ON "MembershipInvitationToken"("tokenHash");

-- CreateIndex
CREATE INDEX "MembershipInvitationToken_membershipId_idx" ON "MembershipInvitationToken"("membershipId");

-- CreateIndex
CREATE INDEX "MembershipInvitationToken_expiresAt_idx" ON "MembershipInvitationToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "MembershipInvitationToken" ADD CONSTRAINT "MembershipInvitationToken_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
