import express from "express";
import { validate } from "../../common/middlewares/validate.middleware.js";
import { changePasswordController, forgotPasswordController, getCurrentUserController, getSessionsController, loginUserController, logoutAllController, logoutUserController, refreshTokenController, registerUserController, resendVerificationController, revokeSessionController, verifyEmailController } from "./auth.controller.js";
import { changePasswordSchema, forgotPasswordSchema, loginUserSchema, logoutUserSchema, refreshTokenSchema, registerUserSchema, verifyEmailSchema } from "./auth.schema.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";

const router = express.Router();

router
    .route("/register")
    .post(validate(registerUserSchema), registerUserController);

router
    .route("/login")
    .post(validate(loginUserSchema), loginUserController);

router
    .route("/refresh-token")
    .post(validate(refreshTokenSchema), refreshTokenController);

router
    .route("/verify-email")
    .get(validate(verifyEmailSchema, "query"), verifyEmailController);

router
    .route("/logout")
    .post(validate(logoutUserSchema), logoutUserController);

router
    .route("/logout-all")
    .post(authMiddleware, logoutAllController);

router
    .route("forgot-password")
    .post(validate(forgotPasswordSchema), forgotPasswordController);

router
    .route("/change-password")
    .patch(authMiddleware, validate(changePasswordSchema), changePasswordController);

router
    .route("/me")
    .get(authMiddleware, getCurrentUserController);

router
    .route("/sessions")
    .get(authMiddleware, getSessionsController);

router
    .route("/sessions/:sessionId")
    .delete(authMiddleware, revokeSessionController);

router
    .route("/resend-verification")
    .post(authMiddleware, resendVerificationController);

export default router;