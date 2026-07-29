import { AppError } from "../../common/errors/AppError.js";
import { generateOrganizationSlug } from "../../common/utils/generateOrganizationSlug.js";
import { comparePassword, hashPassword, hashRefreshToken, hashToken } from "../../lib/bcrypt.js";
import { prisma } from "../../lib/prisma.js";
import { IMembershipRepository } from "../membership/membership.repository.interface.js";
import { IOrganizationRepository } from "../organization/organization.repository.interface.js";
import { IUserRepository } from "../user/user.repository.interface.js";
import { ChangePasswordDTO, ForgotPasswordDTO, LoginUserDTO, LogoutUserDTO, RefreshTokenDTO, RegisterUserDTO, ResetPasswordDTO, VerifyEmailDTO } from "./auth.schema.js";
import crypto, { randomBytes } from "crypto";
import { IRefreshTokenRepository } from "./repositories/refresh-token.repository.interface.js";
import { IPasswordResetTokenRepository } from "./repositories/password-reset-token.repository.interface.js";
import { IVerificationTokenRepository } from "./repositories/verification-token.repository.interface.js";
import { UserRepository } from "../user/user.repository.js";
import { OrganizationRepository } from "../organization/organization.repository.js";
import { MembershipRepository } from "../membership/membership.repository.js";
import { VerificationTokenRepository } from "./repositories/verification-token.repository.js";
import { MembershipRole } from "@prisma/client";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../lib/jwt.js";
import { toJwtPayload } from "../../common/mappers/jwt.mapper.js";
import { IJwtPayload } from "../../common/types/index.js";
import { RefreshTokenRepository } from "./repositories/refresh-token.repository.js";
import { emailQueue } from "../../jobs/queues/email.queue.js";
import { APP_URL } from "../../config/env.config.js";
import { PasswordResetTokenRepository } from "./repositories/password-reset-token.repository.js";
import { toMembershipResponse, toOrganizationResponse, toUserResponse } from "./auth.mapper.js";
import { SessionsResponseDTO } from "./auth.response.js";

export class AuthService {
    constructor(
        private userRepo: IUserRepository,
        private organizationRepo: IOrganizationRepository,
        private membershipRepo: IMembershipRepository,
        private refreshTokenRepo: IRefreshTokenRepository,
        private verificationTokenRepo: IVerificationTokenRepository,
        private passwordResetRepo: IPasswordResetTokenRepository,
    ) {}

    async registerUser(
        data: RegisterUserDTO,
        metadata: {
            deviceName: string,
            ipAddress: string,
            userAgent: string,
        },
    ) {
        const { name, email, password, organizationName, timezone } = data;

        const existingUser = await this.userRepo.findByEmail(email);

        if (existingUser) {
            throw new AppError("User with this email already exists.", 400);
        }

        const hashedPassword = await hashPassword(password);

        const organizationSlug =
            generateOrganizationSlug(organizationName);

        const verificationToken = crypto.randomBytes(32).toString("hex");

        const hashedVerificationToken = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");

        const verificationExpiresAt = new Date(
            Date.now() + 1000 * 60 * 60 * 24 
        );

        const result = await prisma.$transaction(async (tx) => {
            const userRepository  = new UserRepository(tx);
            const organizationRepository = new OrganizationRepository(tx);
            const membershipRepository = new MembershipRepository(tx);
            const verificationTokenRepository = new VerificationTokenRepository(tx);

            const user = await userRepository.create({
                name,
                email,
                password: hashedPassword,
            });

            const organization = await organizationRepository.create({
                name: organizationName,
                slug: organizationSlug,
                timezone,
            });

            const membership = await membershipRepository.create({
                user: {
                    connect: {
                        id: user.id,
                    },
                },
                organization: {
                    connect: {
                        id: organization.id,
                    }
                },
                role: MembershipRole.OWNER,
            });

            await verificationTokenRepository.create({
                tokenHash: hashedVerificationToken,
                userId: user.id,
                expiresAt: verificationExpiresAt,
            });

            return {
                user,
                organization,
                membership,
            }
        });

        const { user, organization, membership } = result;

        const jwtPayload = toJwtPayload(user, organization, membership);

        const accessToken = generateAccessToken(jwtPayload);
        const refreshToken = generateRefreshToken(jwtPayload);

        const hashedRefreshToken = hashRefreshToken(refreshToken);

        const refreshExpiresAt = new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
        )

        await this.refreshTokenRepo.create({
            tokenHash: hashedRefreshToken,
            userId: user.id,
            expiresAt: refreshExpiresAt,
            deviceName: metadata.deviceName,
            ipAddress: metadata.ipAddress,
            userAgent: metadata.userAgent,
            sessionId: crypto.randomUUID(),
            lastUsedAt: new Date(),
        })

        // TODO - message queues
        await emailQueue.add("verification", {
            type: "verification",
            to: user.email,
            data: {
                name: user.name,
                verifyUrl: `${APP_URL}/api/v1/auth/verify-email?token=${verificationToken}`
            }
        });

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isEmailVerified: user.isEmailVerified,
            },

            organization: {
                id: organization.id,
                name: organization.name,
                slug: organization.slug,
            },

            accessToken,
            refreshToken,
            verificationToken,
        }
    }

    async loginUser(
        data: LoginUserDTO,
        metadata: {
            deviceName: string,
            ipAddress: string,
            userAgent: string,
        }
    ) {
        const { email, password } = data;

        const user = await this.userRepo.findByEmail(email);

        if (!user) {
            throw new AppError("Invalid email or password.", 401);
        }

        const passwordMatched  = await comparePassword(password, user.password);

        if (!passwordMatched ) {
            throw new AppError("Incorrect Password.", 401);
        }

        if (user.deletedAt) {
            throw new AppError("User account has been deleted.", 403);
        }

        if (user.status !== "ACTIVE") {
            throw new AppError("User account is inactive.", 403);
        }

        // if (!user.isEmailVerified) {
        //     throw new AppError(
        //         "Please verify your email first.",
        //         403,
        //     );
        // }

        const membership = await this.membershipRepo.findActiveMembershipWithOrganization(user.id);

        if (!membership) {
            throw new AppError(
                "No organization membership found.",
                403,
            );
        }

        if (membership.organization.status !== "ACTIVE") {
            throw new AppError(
                "Organization is inactive.",
                403,
            );
        }

        const jwtPayload = toJwtPayload(
            user,
            membership.organization,
            membership,
        );

        const accessToken = generateAccessToken(jwtPayload);
        const refreshToken = generateRefreshToken(jwtPayload);

        const hashedRefreshToken = hashRefreshToken(refreshToken);

        const refreshExpiresAt = new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
        );

        await this.refreshTokenRepo.create({
            tokenHash: hashedRefreshToken,
            userId: user.id,
            expiresAt: refreshExpiresAt,
            deviceName: metadata.deviceName,
            ipAddress: metadata.ipAddress,
            userAgent: metadata.userAgent,
            sessionId: crypto.randomUUID(),
            lastUsedAt: new Date(),
        });

        await this.userRepo.updateLastLogin(user.id);

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isEmailVerified: user.isEmailVerified,
            },

            organization: {
                id: membership.organization.id,
                name: membership.organization.name,
                slug: membership.organization.slug,
            },

            accessToken,
            refreshToken,
        };
    }

    async refreshToken(data: RefreshTokenDTO, metadata: {
        deviceName: string;
        ipAddress: string;
        userAgent: string;
    }) {
        const { refreshToken } = data;

        const payload = verifyRefreshToken(refreshToken);

        const hashedToken = hashRefreshToken(refreshToken);

        const storedToken = await this.refreshTokenRepo.findByHash(hashedToken);

        if (!storedToken) {
            throw new AppError("Invalid refresh token.", 401);
        }

        if (storedToken.revokedAt) {
            await this.refreshTokenRepo.revokeAll(storedToken.userId);

            throw new AppError("Refresh token has been revoked.", 401);
        }

        if (storedToken.expiresAt < new Date()) {
            await this.refreshTokenRepo.revoke(storedToken.id);

            throw new AppError("Refresh token has expired.", 401);
        }

        const user = await this.userRepo.findById(payload.userId);

        if (!user) {
            throw new AppError("User not found.", 404);
        }

        if (user.deletedAt) {
            throw new AppError("User account deleted.", 403);
        }

        if (user.status !== "ACTIVE") {
            throw new AppError("User account deleted.", 403);
        }

        const membership = await this.membershipRepo.findActiveMembershipWithOrganization(user.id);

        if (!membership) {
            throw new AppError("No active organization found.", 403);
        }

        if (membership.organization.status !== "ACTIVE") {
            throw new AppError("Organization inactive.", 403);
        }

        const jwtPayload = toJwtPayload(
            user,
            membership.organization,
            membership,
        );

        const newAccessToken = generateAccessToken(jwtPayload);
        const newRefreshToken = generateRefreshToken(jwtPayload);

        const hashedNewRefreshToken = hashRefreshToken(newRefreshToken);

        await prisma.$transaction(async (tx) => {
            const refreshRepo = 
                new RefreshTokenRepository(tx);

            // revoke old token
            await refreshRepo.revoke(
                storedToken.id,
            );

            // save new token
            await refreshRepo.create({
                tokenHash: hashedNewRefreshToken,
                userId: user.id,
                expiresAt: new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000,
                ),
                deviceName: metadata.deviceName,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                sessionId: storedToken.sessionId,
                lastUsedAt: new Date(),
                isCurrent: true,
            });
        });

        await this.userRepo.updateLastLogin(
            user.id,
        );

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isEmailVerified: user.isEmailVerified,
            },
            organization: {
                id: membership.organization.id,
                name: membership.organization.name,
                slug: membership.organization.slug,
            },
        };
    }

    async verifyEmail(data: VerifyEmailDTO) {
        const { token } = data;

        console.log(token);

        const tokenHash = hashRefreshToken(token);

        console.log("Hashed token", tokenHash)

        const verificationToken = 
            await this.verificationTokenRepo.findByHash(
                tokenHash,
            );

        if (!verificationToken) {
            throw new AppError(
                "Invalid verification token.",
                400,
            );
        }

        if (verificationToken.usedAt) {
            throw new AppError(
                "Verification token already used.",
                400,
            );
        }

        if (verificationToken.expiresAt < new Date()) {
            throw new AppError(
                "Verification token expired.",
                400,
            );
        }

        const user = 
            await this.userRepo.findById(
                verificationToken.userId,
            );

        if (!user) {
            throw new AppError(
                "User not found",
                404,
            );
        }

        await prisma.$transaction(async (tx) => {
            const userRepository =
                new UserRepository(tx);

            const verificationRepository =
                new VerificationTokenRepository(tx);

            await userRepository.verifyEmail(user.id);

            await verificationRepository.markAsUsed(
                verificationToken.id,
            );

            await verificationRepository.delete(
                verificationToken.id,
            );
        });

        await emailQueue.add("welcome", {
            type: "welcome",
            to: user.email,
            data: {
                name: user.email,
            },
        });

        return;
    }

    async logoutUser(data: LogoutUserDTO) {
        const { refreshToken } = data;

        const hashedToken = hashRefreshToken(refreshToken);

        const storedToken = await this.refreshTokenRepo.findByHash(
            hashedToken,
        );

        if (!storedToken) {
            return;
        }

        if (storedToken.revokedAt) {
            return true;
        }

        await this.refreshTokenRepo.revoke(
            storedToken.id,
        );

        return true;
    }

    async logoutAll(userId: string) {
        const user = await this.userRepo.findById(userId);

        if (!user) {
            throw new AppError(
                "User not found.",
                404,
            );
        }

        await this.refreshTokenRepo.revokeAll(
            user.id,
        );

        return true;
    }

    async forgotPassword(data: ForgotPasswordDTO) {
        const { email } = data;

        const user = await this.userRepo.findByEmail(email);

        if (!user) {
            return;
        }

        await this.passwordResetRepo.deleteByUserId(user.id);

        const resetToken = crypto.randomBytes(32).toString("hex");

        const hashedResetToken = hashToken(resetToken);

        const expiresAt = new Date(
            Date.now() + 1000 * 60 * 60 // 1 hour
        );

        await this.passwordResetRepo.create({
            tokenHash: hashedResetToken,
            userId: user.id,
            expiresAt,
        });

        const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;

        await emailQueue.add("forgot-password", {
            type: "forgot-password",
            to: user.email,
            data: {
                name: user.name,
                resetUrl,
            },
        });

        return;
    }

    async resetPassword(data: ResetPasswordDTO) {
        const { token, password } = data;

        const tokenHash = hashToken(token);

        const resetToken = await this.passwordResetRepo.findByHash(tokenHash);

        if (!resetToken) {
            throw new AppError(
                "Invalid password reset token",
                400,
            );
        }

        if (resetToken.usedAt) {
            throw new AppError(
                "Password reset token already used.",
                400,
            );
        }

        if (resetToken.expiresAt < new Date()) {
            throw new AppError(
                "Password reset token expired.",
                400,
            );
        }

        const user = await this.userRepo.findById(
            resetToken.userId,
        );

        if (!user) {
            throw new AppError(
                "User not found.",
                404,
            );
        }

        const hashedPassword = await hashPassword(password);

        await prisma.$transaction(async (tx) => {
            const userRepository = new UserRepository(tx);
            const passwordResetRepository = new PasswordResetTokenRepository(tx);
            const refreshTokenRepository = new RefreshTokenRepository(tx);

            await userRepository.updatePassword(
                user.id,
                hashedPassword,
            );

            await passwordResetRepository.markAsUsed(
                resetToken.id,
            );

            await passwordResetRepository.delete(
                resetToken.id,
            );

            await refreshTokenRepository.revokeAll(
                user.id,
            );
        });

        await emailQueue.add("password-reset-success", {
            type: "password-reset-success",
            to: user.email,
            data: {
                name: user.name,
            },
        });

        return;
    }

    async changePassword(data: ChangePasswordDTO, userId: string) {
        const { currentPassword, newPassword } = data;

        const user = await this.userRepo.findById(userId);

        if (!user) {
            throw new AppError("User not found.", 404);
        }

        const isPasswordCorrect = await comparePassword(
            currentPassword,
            user.password,
        );

        if (!isPasswordCorrect) {
            throw new AppError(
                "Current password is incorrect.",
                400,
            );
        }

        const hashedNewPassword = await hashPassword(newPassword);

        await prisma.$transaction(async (tx) => {
            const userRepository = new UserRepository(tx);
            const refreshTokenRepository = new RefreshTokenRepository(tx);

            await userRepository.updatePassword(
                user.id,
                hashedNewPassword,
            );

            await refreshTokenRepository.revokeAll(
                user.id,
            );
        });

        await emailQueue.add("password-changed", {
            type: "password-changed",
            to: user.email,
            data: {
                name: user.name,
            },
        });

        return;
    }

    async getCurrentUser(userId: string) {
        const user = await this.userRepo.findById(userId);

        if (!user) {
            throw new AppError("User not found.", 404);
        }

        if (user.deletedAt) {
            throw new AppError("User account has been deleted.", 400);
        }

        if (user.status !== "ACTIVE") {
            throw new AppError("User account is inactive.", 403);
        }

        const membership = 
            await this.membershipRepo.findActiveMembershipWithOrganization(user.id);

        if (!membership) {
            throw new AppError("No active organization found.", 403);
        }

        if (membership.organization.status !== "ACTIVE") {
            throw new AppError("Organization is inactive.", 403);
        }

        return {
            user: toUserResponse(user),
            organization: toOrganizationResponse(membership.organization),
            membership: toMembershipResponse(membership),
        }
    }

    async getSessions(
        userId: string,
        currentRefreshToken?: string,
    ) : Promise<SessionsResponseDTO> {
        const user = await this.userRepo.findById(userId);

        if (!user) {
            throw new AppError(
                "User not found.",
                404,
            );
        }

        const sessions = await this.refreshTokenRepo.findAllActiveByUserId(user.id);

        let currentSessionId: string | null = null;

        if (currentRefreshToken) {
            const tokenHash = 
                hashRefreshToken(currentRefreshToken);

            const currentSession = 
                await this.refreshTokenRepo.findByHash(tokenHash);

            currentSessionId = currentSession?.id ?? null;
        }

        return {
            sessions: sessions.map((session) => ({
                sessionId: session.sessionId,
                deviceName: session.deviceName,
                ipAddress: session.ipAddress,
                userAgent: session.userAgent,
                lastUsedAt: session.lastUsedAt,
                createdAt: session.createdAt,
                isCurrent: 
                    session.id === currentSessionId,
            })),
        };
    }

    async revokeSession(
        userId: string,
        sessionId: string,
    ) {
        const session =
            await this.refreshTokenRepo.findBySessionId(
                sessionId,
            );

        if (!session) {
            throw new AppError(
                "Session not found.",
                404,
            );
        }

        if (session.userId !== userId) {
            throw new AppError(
                "You are not authorized to revoke this session.",
                403,
            );
        }

        if (session.revokedAt) {
            throw new AppError(
                "Session has already been revoked.",
                400,
            );
        }

        await this.refreshTokenRepo.revoke(
            session.id,
        );
    }

    async resendVerificationEmail(
        userId: string,
    ) : Promise<void> {
        const user = await this.userRepo.findById(userId);

        if (!user) {
            throw new AppError(
                "User not found.",
                404,
            );
        }

        if (user.deletedAt) {
            throw new AppError(
                "User account has been deleted.",
                403,
            );
        }

        if (user.status !== "ACTIVE") {
            throw new AppError(
                "User account is inactive.",
                403,
            );
        }

        if (user.isEmailVerified) {
            throw new AppError(
                "Email is already verified.",
                400,
            );
        }

        await this.verificationTokenRepo.deleteByUserId(
            user.id
        );

        const rawToken = randomBytes(32).toString("hex");

        const tokenHash = hashToken(rawToken);

        const expiresAt = new Date(
            Date.now() + 1000 * 60 * 60 * 24,
        );

        await this.verificationTokenRepo.create({
            userId: user.id,
            tokenHash,
            expiresAt,
        });

        await emailQueue.add("verification", {
            type: "verification",
            to: user.email,
            data: {
                name: user.name,
                verifyUrl: `${APP_URL}/api/v1/auth/verify-email?token=${rawToken}`
            }
        });
    }
}
