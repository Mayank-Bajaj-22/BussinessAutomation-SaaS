import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { verifyAccessToken } from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import { UserStatus } from "@prisma/client";
import { updateRequestContext } from "../context/requestContext.js";

function extractAccessToken(
    req: Request,
): string | undefined {
    const authorization = req.headers.authorization;

    if (authorization) {
        const parts = authorization.trim().split(/\s+/);

        if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
            return parts[1];
        }
    }

    const cookieToken = req.cookies?.accessToken;

    if (typeof cookieToken === "string" && cookieToken.length > 0) {
        return cookieToken;
    }

    return undefined;
}

export const authMiddleware = async (
    req: Request,
    _res: Response,
    next: NextFunction,
) => {
    try {
        const token = extractAccessToken(req);

        if (!token) {
            throw new AppError(
                "Authentication required.",
                401,
            );
        }

        let payload;

        try {
            payload = verifyAccessToken(token);
        } catch (error) {
            throw new AppError(
                "Invalid or expired access token.",
                401,
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                id: payload.userId,
            },
        });

        if (!user) {
            throw new AppError(
                "Invalid authentication",
                401,
            );
        }

        if (user.deletedAt) {
            throw new AppError(
                "User account has been deleted.",
                403,
            );
        }

        if (user.status !== UserStatus.ACTIVE) {
            throw new AppError(
                "User account is inactive.",
                403,
            );
        }

        req.user = {
            userId: user.id,
            email: user.email,
            organizationId: payload.organizationId,
            membershipId: payload.membershipId,
            role: payload.membershipRole,
            isEmailVerified: user.isEmailVerified,
        };

        updateRequestContext({
            userId: user.id,
            organizationId:
                payload.organizationId,
            membershipId:
                payload.membershipId,
        });

        next();
    } catch (error) {
        next(error);
    }
}