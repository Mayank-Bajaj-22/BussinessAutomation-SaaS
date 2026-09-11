import { NextFunction, Request, Response } from "express";
import { ZodError, ZodType } from "zod";
import { AppError } from "../errors/AppError.js";

type ValidationSource = 
    | "body"
    | "query"
    | "params";

export const validate = 
    (
        schema: ZodType,
        source: ValidationSource = "body",
    ) => (
        req: Request,
        _res: Response,
        next: NextFunction,
    ) : void => {
        try {
            const result = schema.safeParse(req[source]);

            if (!result.success) {
                const message = result.error.issues.map((issue) => {
                    const path = issue.path.length > 0 
                        ? issue.path.join(".")
                        : "request";

                    return `${path}: ${issue.message}`;
                })
                .join(", ");

                next(
                    new AppError(message, 400),
                );

                return;
            }

            req[source] = result.data as never;

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                next(
                    new AppError("Invalid request data.", 400),
                );

                return;
            }

            next(error);
        };
    };