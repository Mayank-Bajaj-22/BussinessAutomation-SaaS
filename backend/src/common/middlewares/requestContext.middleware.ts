import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import { requestContext } from "../context/requestContext.js";

export const requestContextMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const requestId = 
        (req.headers["x-request-id"] as string) ?? randomUUID();

    res.setHeader("X-Request-ID", requestId);

    requestContext.run(
        {
            requestId,
        },
        () => next(),
    );
};