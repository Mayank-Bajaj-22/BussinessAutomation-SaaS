import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import { requestContext } from "../context/requestContext.js";

const REQUEST_ID_MAX_LENGTH = 128;

function getRequestId(req: Request): string {
    const headerValue = req.header("x-request-id");

    if (!headerValue) {
        return randomUUID();
    }

    const requestId = headerValue.trim();

    if (requestId.length === 0 || requestId.length > REQUEST_ID_MAX_LENGTH) {
        return randomUUID();
    }

    if (/[\r\n]/.test(requestId)) {
        return randomUUID();
    }

    return requestId;
}
export const requestContextMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const requestId = getRequestId(req);

    req.requestId = requestId;

    res.setHeader("X-Request-ID", requestId);

    requestContext.run(
        {
            requestId,
        },
        () => next(),
    );
};