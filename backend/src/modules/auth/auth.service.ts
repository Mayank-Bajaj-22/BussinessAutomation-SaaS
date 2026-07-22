import { AppError } from "../../common/errors/AppError.js";
import { generateOrganizationSlug } from "../../common/utils/generateOrganizationSlug.js";
import { hashPassword, hashRefreshToken } from "../../lib/bcrypt.js";
import { prisma } from "../../lib/prisma.js";
import { IMembershipRepository } from "../membership/membership.repository.interface.js";
import { IOrganizationRepository } from "../organization/organization.repository.interface.js";
import { IUserRepository } from "../user/user.repository.interface.js";
import { IAuthRepository } from "./auth.interface.js";
import { RegisterUserDTO } from "./auth.schema.js";
import crypto from "crypto";
import { IRefreshTokenRepository } from "./repositories/refresh-token.repository.interface.js";
import { IPasswordResetTokenRepository } from "./repositories/password-reset-token.repository.interface.js";
import { IVerificationTokenRepository } from "./repositories/verification-token.repository.interface.js";
import { UserRepository } from "../user/user.repository.js";
import { OrganizationRepository } from "../organization/organization.repository.js";
import { MembershipRepository } from "../membership/membership.repository.js";
import { VerificationTokenRepository } from "./repositories/verification-token.repository.js";
import { MembershipRole } from "@prisma/client";
import { generateAccessToken, generateRefreshToken } from "../../lib/jwt.js";
import { toJwtPayload } from "../../common/mappers/jwt.mapper.js";

export class AuthService {
    constructor(
        private userRepo: IUserRepository,
        private organizationRepo: IOrganizationRepository,
        private membershipRepo: IMembershipRepository,
        private refreshTokenRepo: IRefreshTokenRepository,
        private passwordResetRepo: IPasswordResetTokenRepository,
        private verificationTokenRepo: IVerificationTokenRepository,
    ) {}

    async registerUser(data: RegisterUserDTO) {
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
            deviceName: "Unknown Device",
            ipAddress: "",
            userAgent: "",
            sessionId: crypto.randomUUID(),
            lastUsedAt: new Date(),
        })

        //
        // TODO - message queues
        // await mailService.sendVerificationEmail(
        //      user.email,
        //      verificationToken,
        // );
        //

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
        }
    }
}