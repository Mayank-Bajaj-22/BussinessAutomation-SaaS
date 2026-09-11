import { Resend } from "resend";
import { env } from "../config/env.config.js";
import { logger } from "../config/logger.js";
import { AppError } from "../common/errors/AppError.js";

const resend = new Resend(env.RESEND_API_KEY);

export interface SendMailOptions {
    to: string;
    subject: string;
    html: string;
    from?: string;
}

export async function sendMail({
    to, 
    subject, 
    html, 
    from,
} : SendMailOptions) : Promise<void> {
    try {
        const { data, error } = await resend.emails.send({
            from: from ?? env.MAIL_FROM,
            to,
            subject,
            html,
        });

        if (error) {
            logger.error(
                "Email provider rejected email",
                {
                    provider: "resend",
                    subject,
                    error,
                },
            );

            throw new AppError(
                "Unable to send email.",
                502,
            );
        }

        logger.info(
            "Email sent successfully",
            {
                provider: "resend",
                emailId: data?.id,
                subject,
            }
        )
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }

        logger.error(
            "Unexpected email provider error",
            {
                provider: "resend",
                subject,
                error: error instanceof Error
                    ? {
                        name: error.name,
                        message: error.message,
                        stack: error.stack,
                    }
                    : error,
            },
        );

        throw new AppError(
            "Unable to send email.",
            502,
        );
    }
}