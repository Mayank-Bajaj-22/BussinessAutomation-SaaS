import { Prisma } from "@prisma/client"

export const isPrismaUniqueConstraintError = (
    error: unknown,
    fields: string[],
) : boolean => {
    if (
        !(error instanceof Prisma.PrismaClientKnownRequestError)
    ) {
        return false;
    }
    if (error.code !== "P2002") {
        return false;
    }

    const target = error.meta?.target;

    if (!Array.isArray(target)) {
        return false;
    }

    return fields.every((field) =>
        target.includes(field),
    );
}