import { Request, Response } from "express";
import { CatchAsync } from "../../common/utils/CatchAsync.js";
import { authService } from "./auth.container.js";
import { setCookies } from "../../lib/bcrypt.js";
import { sendResponse } from "../../common/utils/sendResponse.js";

export const registerUserController = CatchAsync(
    async (req: Request, res: Response) => {
        const result = await authService.registerUser(req.body);

        setCookies(res, result.accessToken, result.refreshToken);

        sendResponse(res, 201, {
            success: true,
            message: "Account created successfully.",
            data: result,
        })
    }
)

export const loginUserController = CatchAsync(
    async (req: Request, res: Response) => {
        const result = await authService.loginUser(req.body);

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
)