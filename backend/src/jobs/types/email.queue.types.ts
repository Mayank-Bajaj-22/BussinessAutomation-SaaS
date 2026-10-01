export type EmailJob =
    | {
        type: "verification";
        to: string;
        data: {
            name: string;
            verifyUrl: string;
        };
    }
    | {
        type: "forgot-password";
        to: string;
        data: {
            name: string;
            resetUrl: string;
        };
    }
    | {
        type: "welcome";
        to: string;
        data: {
            name: string;
        };
    } 
    | {
        type: "login-alert";
        to: string;
        data: {
            name: string;
            ipAddress: string;
            userAgent: string;
            location?: string;
        };
    }
    | {
        type: "password-reset-success";
        to: string;
        data: {
            name: string;
        };
    }
    | {
        type: "password-changed";
        to: string;
        data: {
            name: string;
        };
    }
    | {
        type: "membership-invitation";
        to: string;
        data: {
            inviterName: string;
            organizationName: string;
            invitationUrl: string;
            role: string;
        }
    };