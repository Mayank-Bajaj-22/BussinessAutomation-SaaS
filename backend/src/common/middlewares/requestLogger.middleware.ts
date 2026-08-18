import { NextFunction, Request, Response } from "express";
import { logger } from "../../config/logger.js";

export function requestLogger(
    req: Request,
    res: Response,
    next: NextFunction,
) : void {
    const start = process.hrtime.bigint();

    req.logger = logger;

    res.on("finish", () => {
        const durationMs =
            Number(process.hrtime.bigint() - start) / 1_000_000;

        const logData = {
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Math.round(durationMs),
            ip: req.ip,
            userAgent: req.get("user-agent"),
        };

        if (res.statusCode >= 500) {
            req.logger.error("Request completed", logData);
        } else if (res.statusCode >= 400) {
            req.logger.warn("Request completed", logData);
        } else {
            req.logger.info("Request completed", logData);
        }
    });

    next();
}