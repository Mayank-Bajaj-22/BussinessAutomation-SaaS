import { Job } from "bullmq"
import { EmailJob } from "../types/email-job.js"
import { logger } from "../../config/logger.js"
import { emailService } from "../../services/email/email.service.js";

/**
 * Email Processor
 *
 * Receives jobs from BullMQ
 * and delegates them to the EmailService.
 */

export async function emailProcessor(
    job: Job<EmailJob>,
) : Promise<void> {
    logger.info(`Processing Email Job #${job.id}`);

    switch(job.data.type) {
        case "verification" :
            await emailService.sendVerificationEmail({
                to: job.data.to,
                name: job.data.data.name,
                verificationUrl: job.data.data.verifyUrl,
            });
            break;

        case "forgot-password":
            await emailService.sendForgotPasswordEmail({
                to: job.data.to,
                name: job.data.data.name,
                resetUrl: job.data.data.resetUrl,
            });
            break;

        case "welcome":
            await emailService.sendWelcomeEmail({
                to: job.data.to,
                name: job.data.data.name,
            });
            break;

        case "login-alert":
            await emailService.sendLoginAlertEmail({
                to: job.data.to,
                name: job.data.data.name,
                ipAddress: job.data.data.ipAddress,
                userAgent: job.data.data.userAgent,
                location: job.data.data.location,
            });
            break;

        default: {
            const exhaustiveCheck: never = job.data;
            throw new Error(`Unsupported email type: ${JSON.stringify(exhaustiveCheck)}`);
        }
    }

    logger.info(`Email Job #${job.id} completed.`);
}