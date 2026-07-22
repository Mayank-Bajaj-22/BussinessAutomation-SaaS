import { Prisma, User } from "@prisma/client";

export interface IUserRepository {
    findById(
        userId: string,
    ) : Promise<User | null>;

    findByEmail(
        email: string,
    ) : Promise<User | null>;

    create(
        data: Prisma.UserCreateInput,
    ) : Promise<User>;

    update(
        userId: string,
        data: Prisma.UserUpdateInput,
    ) : Promise<User>;

    verifyEmail(
        userId: string,
    ) : Promise<User>;

    updateLastLogin(
        userId: string,
    ) : Promise<User>;

    softDelete(
        userId: string,
    ) : Promise<User>;
}