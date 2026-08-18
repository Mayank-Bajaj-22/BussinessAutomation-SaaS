import { Resend } from "resend";
import { env } from "../config/env.config.js";
import { logger } from "../config/logger.js";

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
            from: from ?? env.MAIL_FROM!,
            to,
            subject,
            html,
        });

        if (error) {
            logger.error(
                "Failed to send email",
                {
                    error,
                    to,
                    subject,
                },
            );

            throw new Error(error.message);
        }

        logger.info(
            "Email sent successfully",
            {
                emailId: data?.id,
                to,
                subject,
            }
        )
    } catch (error) {
        logger.error(
            "Unexpected error while sending email",
            {
                error,
                to,
                subject,
            }
        );

        throw error;
    }
}