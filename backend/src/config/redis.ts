import { Redis } from "ioredis";
import { logger } from "../config/logger.js";
import { env } from "./env.config.js";

/**
 * Redis Connection
 *
 * This connection will be shared by:
 * 1. Queue
 * 2. Worker
 * 3. Queue Events
 */

export const redisConnection = new Redis({
  host: env.REDIS_HOST as string,
  port: Number(env.REDIS_PORT),

  // Required by BullMQ.
  // Allows commands to wait for Redis instead of
  // failing immediately when Redis temporarily disconnects.
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
});

redisConnection.on("connect", () => {
  logger.info("Redis connection established");
});

redisConnection.on("ready", () => {
  logger.info("Redis ready");
});

redisConnection.on("error", (err: Error) => {
  logger.error(
    "Redis connection error",
    {
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
    },
  );
});

redisConnection.on("close", () => {
  logger.warn("Redis connection closed");
});

redisConnection.on("reconnecting", (delay: number) => {
  logger.warn(
    "Redis reconnecting...",
    {
      delay,
    }
  );
});

export async function closeRedisConnection(): Promise<void> {
  if (redisConnection.status === "end") {
    return;
  }

  try {
    await redisConnection.quit();
    logger.info("Redis connection closed gracefully");
  } catch (error) {
    logger.error(
      "Failed to close Redis connection gracefully",
      {
        error: error instanceof Error 
          ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
          : error,
      },
    );
    
    redisConnection.disconnect();
  }
}