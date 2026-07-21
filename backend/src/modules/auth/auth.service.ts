import { AppError } from "../../common/errors/AppError.js";
import { generateOrganizationSlug } from "../../common/utils/generateOrganizationSlug.js";
import { hashPassword } from "../../lib/bcrypt.js";
import { prisma } from "../../lib/prisma.js";
import { IAuthRepository } from "./auth.interface.js";
import { RegisterUserDTO } from "./auth.schema.js";
import crypto from "crypto";

export class AuthService {
    constructor(
        private authRepo: IAuthRepository,
    ) {}

    async registerUser(data: RegisterUserDTO) {
        const { name, email, password, organizationName, timezone } = data;

        const existingUser = await this.authRepo.getUserByEmail(email);

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
            const user = await this.authRepo.c
        })
    }
}