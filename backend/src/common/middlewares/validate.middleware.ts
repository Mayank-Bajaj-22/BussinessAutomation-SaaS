import { NextFunction, Request, Response } from "express";
import { ZodObject, ZodError } from "zod";
import { AppError } from "../errors/AppError.js";

export const validate = 
    (
        schema: ZodObject,
        source: "body" | "query" | "params" = "body",
    ) => (
        req: Request,
        _res: Response,
        next: NextFunction,
    ) => {
        try {
            const parsed = schema.parse(req[source]);
            req[source] = parsed;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                throw new AppError(
                    error.issues
                        .map(
                            (issue) => 
                                `${issue.path.join(".")}: ${issue.message}`,
                        )
                        .join(", "),
                    400,
                );
            }

            next(error);
        }
    }