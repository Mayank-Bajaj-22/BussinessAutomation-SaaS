import { Server } from "node:http";
import { app } from "./app.js";
import { env } from "./config/env.config.js";
import { logger } from "./config/logger.js";
import "./jobs/index.js";
import { prisma } from "./lib/prisma.js";

const port = env.PORT;

let server: Server | undefined;

let isShuttingDown = false;

// start server
async function startServer(): Promise<void> {
    try {
        // verify database connection

        await prisma.$connect();

        logger.info("Database connection established");

        // start HTTP server

        server = app.listen(port, () => {
            logger.info("Server started", {
                port, 
                environment: env.NODE_ENV,
            });
        });

        server.on("error", (error) => {
            logger.error("HTTP server error", {
                error: error instanceof Error
                    ? {
                        name: error.name,
                        message: error.message,
                        stack: error.stack,
                    }
                    : error,
            });

            process.exit(1);
        });
    } catch (error) {
        logger.error("Application startup failed", {
            error: error instanceof Error
                ? {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                }
                : error,
        });

        await prisma.$disconnect();

        process.exit(1);
    }
}

// graceful shutdown

async function gracefulShutdown(
    signal: string,
) : Promise<void> {
    if (isShuttingDown) {
        return;
    }

    isShuttingDown = true;

    logger.info("Graceful shutdown initiated", {
        signal,
    });

    // stop accepting new HTTP requests

    if (server) {
        await new Promise<void>(
            (resolve) => {
                server?.close(() => {
                    logger.info("HTTP server closed");
                    resolve();
                });
            },
        );
    };

    // disconnect database

    try {
        await prisma.$disconnect();

        logger.info("Database connection closed");
    } catch (error) {
        logger.error("Failed to close database connection", {
            error: error instanceof Error
                ? {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                }
                : error,
        });
    }

    logger.info("Application shutdown completed");

    process.exit(0);
};

// process level failures

process.on(
    "SIGTERM",
    () => {
        void gracefulShutdown("SIGTERM");
    },
);

process.on(
    "SIGINT",
    () => {
        void gracefulShutdown("SIGINT");
    },
);

process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception", {
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
        },
    });

    void gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled promise rejection", {
        reason,
    });

    void gracefulShutdown("unhandledRejection");
});

void startServer();