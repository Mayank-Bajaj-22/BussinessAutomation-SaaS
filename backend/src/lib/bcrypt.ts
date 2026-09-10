import bcrypt from "bcrypt";
import crypto from "crypto";
import { Response } from "express";
import { env } from "../config/env.config.js";

const BCRYPT_SALT_ROUNDS = 12;

const COOKIE_PATH = "/";

function durationToMilliseconds(
    duration: string,
) : number {
    const match = duration.match(/^(\d+)(s|m|h|d|w)$/);

    if (!match) {
        throw new Error(`Invalid duration format: ${duration}`);
    }

    const value = Number(match[1]);
    const unit = match[2];

    const multipliers: Record<string, number> = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
        w: 7 * 24 * 60 * 60 * 1000,
    };

    return value * multipliers[unit];
}

export const hashPassword = async (password: string) : Promise<string> => {
    return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export const comparePassword = async (
    password: string,
    hashedPassword: string,
) : Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
}

export const hashToken = (token: string) => {
    return crypto.createHash("sha256").update(token).digest("hex");
}

export const hashRefreshToken = (refreshToken: string) => {
    return hashToken(refreshToken);
}

const accessCookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: COOKIE_PATH,
    maxAge: durationToMilliseconds(
        env.JWT_ACCESS_TOKEN_EXPIRY,
    ),
};

const refreshCookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: COOKIE_PATH,
    maxAge: durationToMilliseconds(
        env.JWT_REFRESH_TOKEN_EXPIRY,
    ),
};

export const setCookies = (
    res: Response, 
    accessToken: string,
    refreshToken: string,
) => {
    res.cookie("accessToken", accessToken, accessCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
}

export const destroyCookies = (res: Response) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: COOKIE_PATH,
    });

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: COOKIE_PATH,
    });
}