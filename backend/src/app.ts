import cookieParser from "cookie-parser";
import express from "express";
import { globalErrorHandler } from "./common/middlewares/error.middleware.js";
import { requestContextMiddleware } from "./common/middlewares/requestContext.middleware.js";
import { globalLimiter } from "./common/middlewares/rateLimiter.middleware.js";

export const app = express();

app.use(requestContextMiddleware);

app.use(globalLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health-check", (req, res) => {
    return res.status(200).send({
        success: true,
        message: "Api is working fine",
    });
});

import apiRouter from "./routes/index.js"

app.use("/api/v1/", apiRouter);

app.use(globalErrorHandler);
