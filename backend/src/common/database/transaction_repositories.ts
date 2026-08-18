import { IPasswordResetTokenRepository } from "../../modules/auth/repositories/password-reset-token.repository.interface.js";
import { IRefreshTokenRepository } from "../../modules/auth/repositories/refresh-token.repository.interface.js";
import { IVerificationTokenRepository } from "../../modules/auth/repositories/verification-token.repository.interface.js";
import { IMembershipInvitationRepository } from "../../modules/membership-invitation/membership-invitation.repository.interface.js";
import { IMembershipRepository } from "../../modules/membership/membership.repository.interface.js";
import { IOrganizationSettingsRepository } from "../../modules/organization-settings/organization-settings.repository.interface.js";
import { IOrganizationWorkingHoursRepository } from "../../modules/organization-working-hours/organization-working-hours.repository.interface.js";
import { IOrganizationRepository } from "../../modules/organization/organization.repository.interface.js";
import { IUserRepository } from "../../modules/user/user.repository.interface.js";
import { IAuditRepository } from "../audit/audit.repository.interface.js";

export interface TransactionRepositories {
    users: IUserRepository,
    refreshTokens: IRefreshTokenRepository,
    verificationTokens: IVerificationTokenRepository,
    passwordResetTokens: IPasswordResetTokenRepository,
    auditLogs: IAuditRepository,
    organizations: IOrganizationRepository,
    memberships: IMembershipRepository,
    membershipInvitations: IMembershipInvitationRepository,
    organizationSettings: IOrganizationSettingsRepository,
    organizationWorkingHours: IOrganizationWorkingHoursRepository,
}