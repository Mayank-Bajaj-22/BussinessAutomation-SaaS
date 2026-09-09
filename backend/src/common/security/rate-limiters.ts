import rateLimit from "express-rate-limit";
import { createRedisStore } from "./rate-limit-store.js";
import { normalizeEmail } from "./normalize-email.js";
import { hashRateLimitKey } from "./hash-rate-limit-key.js";

const RATE_LIMIT_MESSAGE = {
    success: false,
    message: "Too many requests. Please try again later.",
};

/**
 * Global API rate limiter.
 *
 * Protects the entire API from excessive traffic
 * from a single client/IP.
 */

export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRedisStore(),
    message: RATE_LIMIT_MESSAGE,
    handler: (_req, res) => {
        res.status(429).json(RATE_LIMIT_MESSAGE);
    },
    skip: (req) => {
        return (
            req.path === "/health" ||
            req.path === "/favicon.ico"
        );
    },
});

/**
 * Login IP limiter
 *
 * Protects against brute-force attacks
 * coming from a single IP address.
 */
export const loginIpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRedisStore(),
    keyGenerator: (req) => {
        return `auth:login:ip:${req.ip}`;
    },
    message: RATE_LIMIT_MESSAGE,
    handler: (_req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many login attempts. Please try again later.",
        });
    },
});

/**
 * Login account limiter.
 *
 * 10 login attempts per hour
 * for a single normalized email address.
 */
export const loginAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRedisStore(),
    keyGenerator: (req) => {
        const email = req.body?.email;

        if (typeof email !== "string") {
            return `auth:login:account:ip:${req.ip}`;
        }

        const normalizedEmail = normalizeEmail(email);

        const emailHash = hashRateLimitKey(
            normalizedEmail,
        )

        return `auth:login:account:${emailHash}`;
    },
    message: RATE_LIMIT_MESSAGE,
    handler: (_req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many login attempts. Please try again later.",
        });
    },
});

/**
 * Forgot-password IP limiter.
 *
 * Protects the endpoint from email-spam
 * and automated abuse from a single IP.
 */
export const forgotPasswordIpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRedisStore(),
    keyGenerator: (req) => {
        return `auth:forgot-password:ip:${req.ip}`;
    },
    handler: (_req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many password reset requests. Please try again later.",
        });
    },
});

export const forgotPasswordAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRedisStore(),
    keyGenerator: (req) => {
        const email = req.body?.email;

        if (typeof email !== "string") {
            return `auth:forgot-password:account:ip:${req.ip}`;
        }

        const normalizedEmail = normalizeEmail(email);

        const emailHash = hashRateLimitKey(
            normalizedEmail,
        );

        return `auth:forgot-password:account:${emailHash}`;
    },
    handler: (_req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many password reset requests. Please try again later.",
        });
    },
});