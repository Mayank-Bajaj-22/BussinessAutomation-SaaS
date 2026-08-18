import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env.config.js";
import { IJwtPayload } from "../common/types/index.js";

const accessTokenSecret = env.JWT_ACCESS_TOKEN_SECRET!;
const accessTokenExpiry = env.JWT_ACCESS_TOKEN_EXPIRY as SignOptions["expiresIn"];
const refreshTokenSecret = env.JWT_REFRESH_TOKEN_SECRET!;
const refreshTokenExpiry = env.JWT_REFRESH_TOKEN_EXPIRY as SignOptions["expiresIn"];

export const generateAccessToken = (user: IJwtPayload) => {
    return jwt.sign(user, accessTokenSecret, {
        expiresIn: accessTokenExpiry,
    });
}

export const generateRefreshToken = (user: IJwtPayload) => {
    return jwt.sign(user, refreshTokenSecret, {
        expiresIn: refreshTokenExpiry,
    });
}

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, accessTokenSecret);
}

export const verifyRefreshToken = (token: string) : IJwtPayload => {
    return jwt.verify(token, refreshTokenSecret) as IJwtPayload;
}