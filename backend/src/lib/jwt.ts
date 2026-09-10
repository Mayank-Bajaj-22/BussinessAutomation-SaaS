import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { env } from "../config/env.config.js";
import { IJwtPayload } from "../common/types/index.js";

const ACCESS_TOKEN_ALGORITHM = "HS256" as const;
const REFRESH_TOKEN_ALGORITHM = "HS256" as const;

const accessTokenSecret = env.JWT_ACCESS_TOKEN_SECRET!;
const accessTokenExpiry = env.JWT_ACCESS_TOKEN_EXPIRY as SignOptions["expiresIn"];
const refreshTokenSecret = env.JWT_REFRESH_TOKEN_SECRET!;
const refreshTokenExpiry = env.JWT_REFRESH_TOKEN_EXPIRY as SignOptions["expiresIn"];

export const generateAccessToken = (user: IJwtPayload) => {
    return jwt.sign(user, accessTokenSecret, {
        algorithm: ACCESS_TOKEN_ALGORITHM,
        expiresIn: accessTokenExpiry,
    });
}

export const generateRefreshToken = (user: IJwtPayload) => {
    return jwt.sign(user, refreshTokenSecret, {
        algorithm: REFRESH_TOKEN_ALGORITHM,
        expiresIn: refreshTokenExpiry,
    });
}

function isJwtPayload(
    payload: unknown,
) : payload is JwtPayload {
    if (typeof payload !== "object" || payload === null) {
        return false;
    }

    const value = payload as Record<string, unknown>;

    return (
        typeof value.userId === "string" &&
        typeof value.organizationId === "string" &&
        typeof value.membershipId === "string" &&
        typeof value.email === "string" &&
        typeof value.membershipRole === "string" &&
        typeof value.isEmailVerified === "boolean"
    );
}

export const verifyAccessToken = (token: string) => {
    const decoded = jwt.verify(
        token,
        accessTokenSecret,
        {
            algorithms: [
                ACCESS_TOKEN_ALGORITHM,
            ],
        },
    );

    if (!isJwtPayload(decoded)) {
        throw new Error("Invalid access token payload");
    }

    return decoded;
}

export const verifyRefreshToken = (token: string) => {
    const decoded = jwt.verify(
        token,
        refreshTokenSecret,
        {
            algorithms: [
                REFRESH_TOKEN_ALGORITHM,
            ],
        },
    );

    if (!isJwtPayload(decoded)) {
        throw new Error("Invalid refresh token payload");
    }

    return decoded;
}