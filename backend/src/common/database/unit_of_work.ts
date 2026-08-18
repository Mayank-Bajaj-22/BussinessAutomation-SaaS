import { Prisma } from "@prisma/client";
import { TransactionRepositories } from "./transaction_repositories.js";
import { UserRepository } from "../../modules/user/user.repository.js";
import { RefreshTokenRepository } from "../../modules/auth/repositories/refresh-token.repository.js";
import { VerificationTokenRepository } from "../../modules/auth/repositories/verification-token.repository.js";
import { PasswordResetTokenRepository } from "../../modules/auth/repositories/password-reset-token.repository.js";
import { AuditRepository } from "../audit/audit.repository.js";
import { OrganizationRepository } from "../../modules/organization/organization.repository.js";
import { MembershipRepository } from "../../modules/membership/membership.repository.js";
import { MembershipInvitationRepository } from "../../modules/membership-invitation/membership-invitation.repository.js";
import { OrganizationSettingsRepository } from "../../modules/organization-settings/organization-settings.repository.js";
import { OrganizationWorkingHourRepository } from "../../modules/organization-working-hours/organization-working-hours.repository.js";
import { prisma } from "../../lib/prisma.js";

export class UnitOfWork {
    async transaction<T>(
        callback: (repos: TransactionRepositories) => Promise<T>
    ): Promise<T> {
        return prisma.$transaction(async (tx) => {
            return callback(this.createRepositories(tx));
        });
    }

    private createRepositories(
        tx: Prisma.TransactionClient
    ): TransactionRepositories {
        return {
        users: new UserRepository(tx),
        refreshTokens: new RefreshTokenRepository(tx),
        verificationTokens: new VerificationTokenRepository(tx),
        passwordResetTokens: new PasswordResetTokenRepository(tx),
        auditLogs: new AuditRepository(tx),
        organizations: new OrganizationRepository(tx),
        memberships: new MembershipRepository(tx),
        membershipInvitations: new MembershipInvitationRepository(tx),
        organizationSettings: new OrganizationSettingsRepository(tx),
        organizationWorkingHours: new OrganizationWorkingHourRepository(tx),
        };
    }
}
