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
            message: "Account created successfully."
        })
    }
)