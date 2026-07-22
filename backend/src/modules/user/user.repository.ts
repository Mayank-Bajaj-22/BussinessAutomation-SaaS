import { Prisma, PrismaClient, User } from "@prisma/client";
import { IUserRepository } from "./user.repository.interface.js";
import { prisma } from "../../lib/prisma.js";

export class UserRepository implements IUserRepository {
    constructor(
        private readonly db:
            | PrismaClient
            | Prisma.TransactionClient = prisma,
    ) {}

    async findById(
        userId: string,
    ) : Promise<User | null> {
        return this.db.user.findUnique({
            where: {
                id: userId,
            },
        });
    }

    async findByEmail(
        email: string,
    ) : Promise<User | null> {
        return this.db.user.findUnique({
            where: {
                email,
            },
        });
    }

    async create(
        data: Prisma.UserCreateInput,
    ) : Promise<User> {
        return this.db.user.create({
            data,
        });
    }

    async update(
        userId: string,
        data: Prisma.UserUpdateInput,
    ) : Promise<User> {
        return this.db.user.update({
            where: {
                id: userId,
            },
            data,
        });
    }

    async verifyEmail(
        userId: string
    ): Promise<User> {
        return this.db.user.update({
            where: {
                id: userId,
            },
            data: {
                isEmailVerified: true,
            },
        });
    }

    async updateLastLogin(
        userId: string,
    ): Promise<User> {
        return this.db.user.update({
            where: {
                id: userId,
            },
            data: {
                lastLoginAt: new Date(),
            },
        });
    }

    async softDelete(
        userId: string,
    ): Promise<User> {
        return this.db.user.update({
            where: {
                id: userId,
            },
            data: {
                deletedAt: new Date(),
                status: "INACTIVE",
            },
        });
    }
}