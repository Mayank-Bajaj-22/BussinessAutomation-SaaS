import pino from "pino";
import { env } from "./env.config.js";
import { getRequestContext } from "../common/context/requestContext.js";
import { AppLogger, LogData } from "./logger.interface.js";

const baseLogger = pino({
    level: env.NODE_ENV === "development" ? "debug" : "info",

    transport:
        env.NODE_ENV === "development"
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

function getContextData(): LogData {
    const ctx = getRequestContext();

    return {
        requestId: ctx?.requestId,
        userId: ctx?.userId,
        organizationId: ctx?.organizationId,
    };
}

export const logger : AppLogger = {
    info(message: string, data?: LogData) {
        baseLogger.info(
            {
                ...getContextData(),
                ...data,
            },
            message,
        );
    },

    error(message: string, data?: LogData) {
        baseLogger.error(
            {
                ...getContextData(),
                ...data,
            },
            message,
        );
    },

    warn(message: string, data?: LogData) {
        baseLogger.warn(
            {
                ...getContextData(),
                ...data,
            },
            message,
        );
    },

    debug(message: string, data?: LogData) {
        baseLogger.debug(
            {
                ...getContextData(),
                ...data,
            },
            message,
        );
    },
};