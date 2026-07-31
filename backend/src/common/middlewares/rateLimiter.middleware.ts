import { rateLimit } from "express-rate-limit";
import { RedisReply, RedisStore } from "rate-limit-redis";
import { redisConnection } from "../../config/redis.js";

export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes

    max: 100,

    standardHeaders: true,
    legacyHeaders: false,

    store: new RedisStore({
        sendCommand: (command, ...args) => redisConnection.call(command, ...args) as Promise<RedisReply>,
    }),

    message: {
        success: false,
        message:
            "Too many requests. Please try again after 15 minutes.",
    },

    skip: (req) => {
        return (
            req.path === "/health" ||
            req.path === "/favicon.ico"
        );
    },

    handler: (_req, res) => {
        res.status(429).json({
            success: false,
            message:
                "Too many requests. Please try again later.",
        });
    },
});