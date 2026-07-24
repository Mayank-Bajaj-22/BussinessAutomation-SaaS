import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { verifyAccessToken } from "../../lib/jwt.js";
import { IJwtPayload } from "../types/index.js";
import { prisma } from "../../lib/prisma.js";
import { UserStatus } from "@prisma/client";

export const authMiddleware = async (
    req: Request,
    _res: Response,
    next: NextFunction,
) => {
    try {
        let token: string | undefined;

        // bearer token
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer")) {
            token = authHeader.split(" ")[1];
        }

        // cookie
        if (!token && req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }

        if (!token) {
            throw new AppError(
                "Authentication required.",
                401,
            );
        }

        const payload = verifyAccessToken(token);

        if (typeof payload !== "object" || payload === null) {
            throw new AppError(
                "Invalid access token",
                401,
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                id: payload.userId,
            },
        });

        if (!user) {
            throw new AppError("User not found.", 401);
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
            userId: payload.userId,
            email: payload.email,
            organizationId: payload.organizationId,
            role: payload.role,
        }

        next();
    } catch (error) {
        next(error);
    }
}