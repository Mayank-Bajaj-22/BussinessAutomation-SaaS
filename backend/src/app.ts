import cookieParser from "cookie-parser";
import express, { Request } from "express";
import { globalErrorHandler } from "./common/middlewares/error.middleware.js";
import { requestContextMiddleware } from "./common/middlewares/requestContext.middleware.js";
import { requestLogger } from "./common/middlewares/requestLogger.middleware.js";

export const app = express();

app.use(requestContextMiddleware);
app.use(requestLogger);

app.use(
    express.json({
        verify: (req: Request, _res, buf) => {
            if (req.originalUrl.includes("/api/v1/whatsapp/webhook")) {
                req.rawBody = Buffer.from(buf);
            }
        },
    }),
);

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (req, res) => {
    return res.status(200).send({
        success: true,
        message: "Api is working fine",
    });
});

import apiRouter from "./routes/index.js"
import { globalLimiter } from "./common/security/rate-limiters.js";

app.use("/api/v1/", globalLimiter, apiRouter);

app.use(globalErrorHandler);
