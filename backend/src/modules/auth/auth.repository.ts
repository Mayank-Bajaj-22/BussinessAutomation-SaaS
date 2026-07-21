// import { PrismaClient } from "@prisma/client/extension";
// import { IAuthRepository, IRegisterUserData } from "./auth.interface.js";
// import { prisma } from "../../lib/prisma.js";
// import { Membership, MembershipRole, Organization, PasswordResetToken, Prisma, RefreshToken, User, VerificationToken } from "@prisma/client";

// export class AuthRepository implements IAuthRepository {
//     constructor(
//         private readonly db: PrismaClient | Prisma.TransactionClient = prisma,
//     ) {}

//     async getUserById(userId: string): Promise<User | null> {
//         return this.db.user.findUnique({
//             where: {
//                 id: userId,
//             },
//         });
//     }

//     async getUserByEmail(email: string): Promise<User | null> {
//         return this.db.user.findUnique({
//             where: {
//                 email,
//             },
//         });
//     }

//     async createUserWithOrganization(data: IRegisterUserData, passwordHash: string, organizationSlug: string): Promise<{ user: User; organization: Organization; membership: Membership; }> {
//         return await this.db.$transaction(async (tx) => {
//             const user = await tx.user.create({
//                 data: {
//                     name: data.name,
//                     email: data.email,
//                     password: passwordHash,
//                 },
//             });

//             const organization = await tx.organization.create({
//                 data: {
//                     name: data.organizationName,
//                     slug: organizationSlug,
//                     timezone: data.timezone,
//                 },
//             });

//             const membership = await tx.membership.create({
//                 data: {
//                     userId: user.id,
//                     organizationId: organization.id,
//                     role: MembershipRole.OWNER,
//                 },
//             });

//             return {
//                 user,
//                 organization,
//                 membership,
//             };
//         });
//     }

//     async createRefreshToken(data: { tokenHash: string; userId: string; expiresAt: string; ipAddress?: string | null; userAgent?: string | null; deviceName?: string | null; }): Promise<RefreshToken> {
//         return this.db.refreshToken.create({
//             data,
//         });
//     }

//     async findRefreshTokenByHash(tokenHash: string): Promise<RefreshToken | null> {
//         return this.db.refreshToken.findUnique({
//             where: {
//                 tokenHash,
//             },
//         });
//     }

//     async revokeRefreshToken(refreshTokenId: string): Promise<Prisma.BatchPayload> {
//         return this.db.refreshToken.update({
//             where: {
//                 id: refreshTokenId,
//             },
//             data: {
//                 revokedAt: new Date(),
//             },
//         });
//     }

//     async revokeAllRefreshTokens(userId: string): Promise<Prisma.BatchPayload> {
//         return this.db.refreshToken.updateMany({
//             where: {
//                 userId,
//                 revokedAt: null,
//             },
//             data: {
//                 revokedAt: new Date(),
//             },
//         });
//     }

//     async createVerificationToken(data: { tokenHash: string; userId: string; expiresAt: Date; }): Promise<VerificationToken> {
//         return this.db.VerificationToken.create({
//             data,
//         });
//     }

//     async findVerificationToken(tokenHash: string): Promise<VerificationToken | null> {
//         return this.db.verificationToken.findUnique({
//             where: {
//                 tokenHash,
//             },
//         });
//     }

//     async deleteVerificationToken(verificationTokenId: string): Promise<VerificationToken> {
//         return this.db.verificationToken.delete({
//             where: {
//                 id: verificationTokenId,
//             },
//         });
//     }

//     async createPasswordResetToken(data: { tokenHash: string; userId: string; expiresAt: Date; }): Promise<PasswordResetToken> {
//         return this.db.passwordResetToken.create({
//             data,
//         });
//     }

//     async findPasswordResetToken(tokenHash: string): Promise<PasswordResetToken | null> {
//         return this.db.passwordResetToken.findUnique({
//             where: {
//                 tokenHash,
//             },
//         });
//     }

//     async deletePasswordResetToken(passwordResetTokenId: string): Promise<PasswordResetToken> {
//         return this.db.passwordResetToken.delete({
//             where: {
//                 id: passwordResetTokenId,
//             },
//         });
//     }

//     async verifyUserEmail(userId: string): Promise<User> {
//         return this.db.user.update({
//             where: {
//                 id: userId,
//             },
//             data: {
//                 isEmailVerified: true,
//             },
//         });
//     }
// }