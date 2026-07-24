import express from "express";
import { validate } from "../../common/middlewares/validate.middleware.js";
import { loginUserController, refreshTokenController, registerUserController } from "./auth.controller.js";
import { loginUserSchema, refreshTokenSchema, registerUserSchema } from "./auth.schema.js";

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

export default router;