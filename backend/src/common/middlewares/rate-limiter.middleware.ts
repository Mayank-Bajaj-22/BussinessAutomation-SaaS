import { rateLimit } from "express-rate-limit";
import { RedisReply, RedisStore } from "rate-limit-redis";
import { redisConnection } from "../../config/redis.js";
import { NextFunction, Request, Response } from "express";

export const rateLimiterHandler = (
    _req: Request,
    res: Response,
    _next: NextFunction,
) => {
    res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
    });
};