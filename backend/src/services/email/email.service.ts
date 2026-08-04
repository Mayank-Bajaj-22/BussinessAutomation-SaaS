import { sendMail } from "../../lib/mail.js";
import { forgotPasswordTemplate } from "./templates/forgot-password.template.js";
import { loginAlertTemplate } from "./templates/login-alert.template.js";
import { membershipInvitationTemplate } from "./templates/membership-invitation.template.js";
import { passwordChangedTemplate } from "./templates/password-changed.template.js";
import { passwordResetSuccessTemplate } from "./templates/password-reset-success.template.js";
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

    async sendPasswordResetSuccessEmail(params: {
        to: string;
        name: string;
    }) {
        await sendMail({
            to: params.to,
            subject: "Password Reset Successful",
            html: passwordResetSuccessTemplate({
                name: params.name,
            }),
        });
    }

    async sendPasswordChangedEmail(params: {
        to: string;
        name: string;
    }) {
        await sendMail({
            to: params.to,
            subject: "Password Changed",
            html: passwordChangedTemplate({
                name: params.name,
            }),
        });
    }

    async sendInvitationEmail(params: {
        to: string;
        inviterName: string;
        organizationName: string;
        invitationUrl: string;
        role: string;
    }) : Promise<void> {
        await sendMail({
            to: params.to,
            subject: `Invitation to join ${params.organizationName}`,
            html: membershipInvitationTemplate({
                inviterName: params.inviterName,
                organizationName: params.organizationName,
                invitationUrl: params.invitationUrl,
                role: params.role,
            }),
        });
    }
}

export const emailService = new EmailService();