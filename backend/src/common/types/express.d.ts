import { Membership, Organization } from "@prisma/client";
import { AppLogger } from "../../config/logger.interface.ts";

declare global {
    namespace Express {
        interface Request {
            requestId: string,
            logger: AppLogger,
            user?: {
                requestId?: string;
                userId?: string;
                organizationId?: string;
                membershipId?: string;
                role: string;
                email: string;
            },
            organization?: Organization;
            membership?: Membership;
        }
    }
}

export {};