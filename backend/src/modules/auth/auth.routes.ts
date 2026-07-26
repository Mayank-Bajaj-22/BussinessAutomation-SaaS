import express from "express";
import { validate } from "../../common/middlewares/validate.middleware.js";
import { loginUserController, logoutAllController, logoutUserController, refreshTokenController, registerUserController, verifyEmailController } from "./auth.controller.js";
import { loginUserSchema, logoutUserSchema, refreshTokenSchema, registerUserSchema, verifyEmailSchema } from "./auth.schema.js";
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

export default router;