import { Worker } from "bullmq";
import { logger } from "../../config/logger.js";
import { redisConnection } from "../../lib/redis.js";
import { emailProcessor } from "../processors/email.processor.js";
import { EmailJob } from "../types/email-job.js";

/**
 * Email Worker
 *
 * Continuously listens to the "email" queue.
 */

export const emailWorker = new Worker<EmailJob>("email", emailProcessor, {
  connection: redisConnection,

  /**
   * Number of jobs processed simultaneously.
   */

  concurrency: 5,
});

/**
 * Worker Ready
 */
emailWorker.on("ready", () => {
  logger.info("Email Worker Ready");
});

/**
 * Job Started
 */
emailWorker.on("active", (job) => {
  logger.info("Email Job Started", {
    jobId: job?.id,
    jobName: job?.name,
  });
});

/**
 * Job Completed
 */
emailWorker.on("completed", (job) => {
  logger.info("Email Job Completed", {
    jobId: job.id,
    jobName: job.name,
  });
});

/**
 * Job Failed
 */
emailWorker.on("failed", (job, error) => {
  logger.error("Email Job Failed", {
    jobId: job?.id,
    jobName: job?.name,
    error: error.message,
  });
});

/**
 * Worker Error
 */
emailWorker.on("error", (error) => {
  logger.error("Email Worker Error", {
    error: error.message,
  });
});

/**
 * Worker Closed
 */
emailWorker.on("closed", () => {
  logger.warn("Email Worker Closed");
});

emailWorker.on("stalled", (jobId) => {
  logger.warn("Job Stalled", {
    jobId,
  });
});
