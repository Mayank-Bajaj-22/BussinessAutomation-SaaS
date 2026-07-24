import cookieParser from "cookie-parser";
import express from "express";
import { globalErrorHandler } from "./common/middlewares/error.middleware.js";
import { requestContextMiddleware } from "./common/middlewares/requestContext.middleware.js";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health-check", (req, res) => {
    return res.status(200).send({
        success: true,
        message: "Api is working fine",
    });
});

import authRouter from "./modules/auth/auth.routes.js";

app.use("/api/v1/auth", authRouter);

app.use(globalErrorHandler);
app.use(requestContextMiddleware);