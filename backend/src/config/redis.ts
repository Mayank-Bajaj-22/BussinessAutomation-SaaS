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

  // BullMQ requires this option
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  logger.info("Redis Connected.");
});

redisConnection.on("error", (err: Error) => {
  logger.error(`Redis Connection Error: ${err.message}`);
});

redisConnection.on("close", () => {
  logger.warn("Redis Connection Closed.");
});
