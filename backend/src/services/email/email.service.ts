import { sendMail } from "../../lib/mail.js";
import { forgotPasswordTemplate } from "./templates/forgot-password.template.js";
import { loginAlertTemplate } from "./templates/login-alert.template.js";
import { verificationTemplate } from "./templates/verification.template.js";
import { welcomeTemplate } from "./templates/welcome.template.js";

class EmailService {
    async sendVerificationEmail(params: {
        to: string,
        name: string,
        verificationUrl: string,
    }) : Promise<void> {
        await sendMail({
            to: params.to,
            subject: "Verify your email",
            html: verificationTemplate({
                name: params.name,
                verificationUrl: params.verificationUrl,
            }),
        });
    }

    async sendForgotPasswordEmail(params: {
        to: string;
        name: string;
        resetUrl: string;
    }): Promise<void> {
        await sendMail({
            to: params.to,
            subject: "Reset your password",
            html: forgotPasswordTemplate({
                name: params.name,
                resetUrl: params.resetUrl,
            }),
        });
    }

    async sendWelcomeEmail(params: {
        to: string;
        name: string;
    }): Promise<void> {
        await sendMail({
            to: params.to,
            subject: "Welcome 🎉",
            html: welcomeTemplate({
                name: params.name,
            }),
        });
    }

    async sendLoginAlertEmail(params: {
        to: string;
        name: string;
        ipAddress: string;
        userAgent: string;
        location?: string;
    }): Promise<void> {
        await sendMail({
            to: params.to,
            subject: "New Login Detected",
            html: loginAlertTemplate({
                name: params.name,
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
                location: params.location,
            }),
        });
    }
}

export const emailService = new EmailService();