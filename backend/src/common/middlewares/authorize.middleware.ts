import { MembershipRole } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";

export const authorize = 
    (...roles: MembershipRole[]) => (
        req: Request,
        _res: Response,
        next: NextFunction
    ) => {
        if (!req.membership) {
            return next(
                new AppError(
                    "Membership not found.",
                    403,
                ),
            );
        }

        if (!roles.includes(req.membership.role)) {
            return next(
                new AppError(
                    "You don't have permission to perform this action.",
                    403,
                ),
            );
        }

        next();
    }