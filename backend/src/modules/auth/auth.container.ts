import { MembershipRepository } from "../membership/membership.repository.js";
import { OrganizationRepository } from "../organization/organization.repository.js";
import { UserRepository } from "../user/user.repository.js";
import { AuthService } from "./auth.service.js";
import { PasswordResetTokenRepository } from "./repositories/password-reset-token.repository.js";
import { RefreshTokenRepository } from "./repositories/refresh-token.repository.js";
import { VerificationTokenRepository } from "./repositories/verification-token.repository.js";

const userRepository = new UserRepository();
const organizationRepository = new OrganizationRepository();
const membershipRepository = new MembershipRepository();

const refreshTokenRepository  = new RefreshTokenRepository();
const verificationTokenRepository = new VerificationTokenRepository();
const passwordResetTokenRepository = new PasswordResetTokenRepository();

const authService = new AuthService(
    userRepository,
    organizationRepository,
    membershipRepository,
    refreshTokenRepository,
    verificationTokenRepository,
    passwordResetTokenRepository,
);

export { authService };