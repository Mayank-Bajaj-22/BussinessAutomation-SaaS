import { MembershipRole } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";

export const authorize =
    (...roles: MembershipRole[]) => {
        return (
            req: Request,
            _res: Response,
            next: NextFunction,
        ): void => {
            if (!req.membership) {
                next(
                    new AppError(
                        "Membership not found.",
                        403,
                    ),
                );

                return;
            }

            if (roles.length === 0) {
                next(
                    new AppError(
                        "Authorization roles are not configured.",
                        500,
                        false,
                    ),
                );

                return;
            }

            if (
                !roles.includes(
                    req.membership.role,
                )
            ) {
                next(
                    new AppError(
                        "You don't have permission to perform this action.",
                        403,
                    ),
                );

                return;
            }

            next();
        };
    };