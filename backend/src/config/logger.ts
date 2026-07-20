import pino from "pino";
import { NODE_ENV } from "./env.config.js";
import { getRequestContext } from "../common/context/requestContext.js";

const baseLogger = pino({
    level: NODE_ENV === "development" ? "debug" : "info",

    transport:
        NODE_ENV === "development"
            ? {
                    target: "pino-pretty",
                    options: {
                        colorize: true,
                        translateTime: "SYS:standard",
                        ignore: "pid,hostname",
                    },
            }
            : undefined,

    timestamp: pino.stdTimeFunctions.isoTime,

    base: {
        service: "whatsapp-automation-api",
    },
});

export const logger = {
    info(message: string, data?: Record<string, unknown>) {
        const ctx = getRequestContext();

        baseLogger.info(
            {
                requestId: ctx?.requestId,
                userId: ctx?.userId,
                organizationId: ctx?.organizationId,
                ...data,
            },
            message,
        );
    },

    error(message: string, data?: Record<string, unknown>) {
        const ctx = getRequestContext();

        baseLogger.error(
            {
                requestId: ctx?.requestId,
                userId: ctx?.userId,
                organizationId: ctx?.organizationId,
                ...data,
            },
            message,
        );
    },

    warn(message: string, data?: Record<string, unknown>) {
        const ctx = getRequestContext();

        baseLogger.warn(
            {
                requestId: ctx?.requestId,
                userId: ctx?.userId,
                organizationId: ctx?.organizationId,
                ...data,
            },
            message,
        );
    },

    debug(message: string, data?: Record<string, unknown>) {
        const ctx = getRequestContext();

        baseLogger.debug(
            {
                requestId: ctx?.requestId,
                userId: ctx?.userId,
                organizationId: ctx?.organizationId,
                ...data,
            },
            message,
        );
    },
};