import { Queue } from "bullmq";
import { EmailJob } from "../types/email-job.js";
import { redisConnection } from "../../config/redis.js";

/**
 * Email Queue
 *
 * Responsible only for adding email jobs to Redis.
 * It does NOT send emails.
 */

export const emailQueue = new Queue<EmailJob>("email", {
  connection: redisConnection,

  prefix: "business-automation",

  defaultJobOptions: {
    attempts: 3,

    backoff: {
      type: "exponential",
      delay: 2000,
    },

    removeOnComplete: 100,

    removeOnFail: 500,
  },
});
