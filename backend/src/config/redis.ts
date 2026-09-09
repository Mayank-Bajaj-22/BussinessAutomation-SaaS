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
});

redisConnection.on("connect", () => {
  logger.info("Redis connected.");
});

redisConnection.on("ready", () => {
  logger.info("Redis ready.");
});

redisConnection.on("error", (err: Error) => {
  logger.error(`Redis connection error: ${err.message}`);
});

redisConnection.on("close", () => {
  logger.warn("Redis connection closed.");
});

redisConnection.on("reconnecting", () => {
  logger.warn("Redis reconnecting...");
});