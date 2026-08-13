import { Request, Response } from "express";
import { CatchAsync } from "../../common/utils/CatchAsync.js";
import { authService } from "./auth.container.js";
import { destroyCookies, setCookies } from "../../lib/bcrypt.js";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { VerifyEmailDTO } from "./auth.schema.js";

export const registerUserController = CatchAsync(
    async (req: Request, res: Response) => {
        const result = await authService.registerUser(
            req.body,
            {
                deviceName:
                    req.headers["sec-ch-ua-platform"]?.toString() ??
                    "Unknown Device",

                ipAddress:
                    req.ip ??
                    req.socket.remoteAddress ??
                    "Unknown",

                userAgent:
                    req.headers["user-agent"] ??
                    "Unknown",
            },
        );

        setCookies(res, result.accessToken, result.refreshToken);

        sendResponse(res, 201, {
            success: true,
            message: "Account created successfully. Please verify your email.",
            data: result,
        })
    }
)

export const loginUserController = CatchAsync(
    async (req: Request, res: Response) => {
        const result = await authService.loginUser(
            req.body,
            {
                deviceName:
                    req.headers["sec-ch-ua-platform"]?.toString() ??
                    "Unknown Device",

                ipAddress:
                    req.ip ??
                    req.socket.remoteAddress ??
                    "Unknown",

                userAgent:
                    req.headers["user-agent"] ??
                    "Unknown",
            },
        );

        setCookies(res, result.accessToken, result.refreshToken);

        sendResponse(res, 200, {
            success: true,
            message: "User logged in successfully.",
            data: result
        });
    }
)

export const refreshTokenController = CatchAsync(
    async (req: Request, res: Response) => {
        const result = await authService.refreshToken(
            req.body,
            {
                deviceName: 
                    req.headers["sec-ch-ua-platform"]?.toString() ??
                    "Unknown Device",
                ipAddress:
                    req.ip ??
                    req.socket.remoteAddress ??
                    "Unknown",
                userAgent:
                    req.headers["user-agent"] ??
                    "Unknown",
            },
        );

        setCookies(res, result.accessToken, result.refreshToken);

        sendResponse(res, 200, {
            success: true,
            message: "Refresh token rotated successfully.",
            data: {
                user: result.user,
                organization: result.organization,
            },
        });
    }
);

export const verifyEmailController = CatchAsync(
    async (req: Request, res: Response) => {
        await authService.verifyEmail(req.query as VerifyEmailDTO);

        sendResponse(res, 200, {
            success: true,
            message: "Email verified successfully."
        });
    }
);

export const logoutUserController = CatchAsync(
    async (req: Request, res: Response) => {
        const isLoggedOut = await authService.logoutUser(req.body);

        if (isLoggedOut) {
            destroyCookies(res);
        }

        sendResponse(res, 200, {
            success: true,
            message: "Logged out successfully.",
        });
    }
);

export const logoutAllController = CatchAsync(
    async (req: Request, res: Response) => {
        const userId = req.user!.userId;

        const isLoggedOut = await authService.logoutAll(userId!);

        if (isLoggedOut) {
            destroyCookies(res);
        }

        sendResponse(res, 200, {
            success: true,
            message: "Logout out from all devices successfully."
        });
    }
);

export const forgotPasswordController = CatchAsync(
    async (req: Request, res: Response) => {
        await authService.forgotPassword(req.body);

        sendResponse(res, 200, {
            success: true,
            message: "If an account with that email exists, a password reset link has been sent."
        });
    }
);

export const resetPasswordController = CatchAsync(
    async (req: Request, res: Response) => {
        await authService.resetPassword(req.body);

        sendResponse(res, 200, {
            success: true,
            message: "Reset password successfully."
        });
    }
);

export const changePasswordController = CatchAsync(
    async (req: Request, res: Response) => {
        await authService.changePassword(req.body, req.user!.userId!);

        sendResponse(res, 200, {
            success: true,
            message: "Password changed successfully.",
        });
    }
);

export const getCurrentUserController = CatchAsync(
    async (req: Request, res: Response) => {
        const result = await authService.getCurrentUser(
            req.user!.userId!,
        );

        sendResponse(res, 200, {
            success: true,
            message: "Current user fetched successfully.",
            data: result,
        });
    }
);

export const getSessionsController = CatchAsync(
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies?.refreshToken;

        const result = await authService.getSessions(
            req.user?.userId!,
            refreshToken,
        );

        sendResponse(res, 200, {
            success: true,
            message: "Sessions fetched successfully.",
            data: result,
        });
    }
);

export const revokeSessionController = CatchAsync(
    async (req: Request, res: Response) => {
        await authService.revokeSession(
            req.user!.userId!,
            req.params.sessionId as string,
        );

        sendResponse(res, 200, {
            success: true,
            message: "Session revoked successfully.",
        });
    }
);

export const resendVerificationController = CatchAsync(
    async (req: Request, res: Response) => {
        await authService.resendVerificationEmail(
            req.user!.userId!,
        );

        sendResponse(res, 200, {
            success: true,
            message: "Verification email sent successfully.",
        });
    }
);

export const switchOrganizationController = CatchAsync(
    async (req: Request, res: Response) => {
        const userId = req.user?.userId!;
        const organizationId = req.params.organizationId as string;

        const result = 
            await authService.switchOrganization(
                {
                    userId,
                    organizationId,
                },
                {
                    deviceName:
                        req.headers["x-device-name"]?.toString() ??
                        "Unknown Device",

                    ipAddress:
                        req.ip ?? "",

                    userAgent:
                        req.headers["user-agent"]?.toString() ?? "",
                },
            );

        setCookies(res, result.accessToken, result.refreshToken);
        
        sendResponse(res, 200, {
            success: true,
            message: "Organization switched successfully.",
            data: result,
        });
    }
)