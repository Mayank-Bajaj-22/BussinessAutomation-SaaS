import { Membership, MembershipRole, Organization } from "@prisma/client";
import { AppLogger } from "../../config/logger.interface.js";

declare global {
    namespace Express {
        interface Request {
            requestId: string;
            logger: AppLogger;
            user?: {
                userId: string;
                email: string;
                organizationId: string;
                membershipId?: string;
                role: MembershipRole;
                isEmailVerified: boolean;
            };
            organization?: Organization;
            membership?: Membership;
            rawBody?: Buffer;
        }
    }
}

export {};