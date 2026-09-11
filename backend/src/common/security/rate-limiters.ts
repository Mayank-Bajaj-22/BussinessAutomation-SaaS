import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { createRedisStore } from "./rate-limit-store.js";
import { normalizeEmail } from "./normalize-email.js";
import { hashRateLimitKey } from "./hash-rate-limit-key.js";

const RATE_LIMIT_MESSAGE = {
    success: false,
    message:
        "Too many requests. Please try again later.",
};

const createLimiterHandler =
    (message: string) => {
        return (
            _req: unknown,
            res: {
                status: (
                    code: number,
                ) => {
                    json: (
                        body: unknown,
                    ) => unknown;
                };
            },
        ) => {
            return res
                .status(429)
                .json({
                    success: false,
                    message,
                });
        };
    };

/**
 * Global API rate limiter.
 *
 * 100 requests / 15 minutes / IP.
 */
export const globalLimiter =
    rateLimit({
        windowMs:
            15 * 60 * 1000,

        limit: 100,

        standardHeaders: true,

        legacyHeaders: false,

        store:
            createRedisStore(
                "global-api:",
            ),

        passOnStoreError: true,

        message:
            RATE_LIMIT_MESSAGE,

        handler:
            createLimiterHandler(
                RATE_LIMIT_MESSAGE.message,
            ),

        keyGenerator: (req) => {
            return ipKeyGenerator(
                req.ip ?? "unknown",
            );
        },
    });

/**
 * Login IP limiter.
 *
 * 20 attempts / 15 minutes / IP.
 */
export const loginIpLimiter =
    rateLimit({
        windowMs:
            15 * 60 * 1000,

        limit: 20,

        standardHeaders: true,

        legacyHeaders: false,

        store:
            createRedisStore(
                "auth-login-ip:",
            ),

        passOnStoreError: false,

        keyGenerator: (req) => {
            return `ip:${ipKeyGenerator(
                req.ip ?? "unknown",
            )}`;
        },

        handler: createLimiterHandler(
            "Too many login attempts. Please try again later.",
        ),
    });

/**
 * Login account limiter.
 *
 * 10 attempts / hour / normalized email.
 */
export const loginAccountLimiter =
    rateLimit({
        windowMs:
            60 * 60 * 1000,

        limit: 10,

        standardHeaders: true,

        legacyHeaders: false,

        store:
            createRedisStore(
                "auth-login-account:",
            ),

        passOnStoreError: false,

        keyGenerator: (req) => {
            const email =
                req.body?.email;

            if (
                typeof email !==
                "string"
            ) {
                return `ip:${ipKeyGenerator(
                    req.ip ?? "unknown",
                )}`;
            }

            const normalizedEmail =
                normalizeEmail(email);

            const emailHash =
                hashRateLimitKey(
                    normalizedEmail,
                );

            return `email:${emailHash}`;
        },

        handler: createLimiterHandler(
            "Too many login attempts. Please try again later.",
        ),
    });

/**
 * Forgot-password IP limiter.
 *
 * 5 requests / 15 minutes / IP.
 */
export const forgotPasswordIpLimiter =
    rateLimit({
        windowMs:
            15 * 60 * 1000,

        limit: 5,

        standardHeaders: true,

        legacyHeaders: false,

        store:
            createRedisStore(
                "auth-forgot-password-ip:",
            ),

        passOnStoreError: false,

        keyGenerator: (req) => {
            return `ip:${ipKeyGenerator(
                req.ip ?? "unknown",
            )}`;
        },

        handler: createLimiterHandler(
            "Too many password reset requests. Please try again later.",
        ),
    });

/**
 * Forgot-password account limiter.
 *
 * 3 requests / hour / email.
 */
export const forgotPasswordAccountLimiter =
    rateLimit({
        windowMs:
            60 * 60 * 1000,

        limit: 3,

        standardHeaders: true,

        legacyHeaders: false,

        store:
            createRedisStore(
                "auth-forgot-password-account:",
            ),

        passOnStoreError: false,

        keyGenerator: (req) => {
            const email =
                req.body?.email;

            if (
                typeof email !==
                "string"
            ) {
                return `ip:${ipKeyGenerator(
                    req.ip ?? "unknown",
                )}`;
            }

            const normalizedEmail =
                normalizeEmail(email);

            const emailHash =
                hashRateLimitKey(
                    normalizedEmail,
                );

            return `email:${emailHash}`;
        },

        handler: createLimiterHandler(
            "Too many password reset requests. Please try again later.",
        ),
    });