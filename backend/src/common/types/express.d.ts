import { Membership, Organization } from "@prisma/client";

declare global {
    namespace Express {
        interface Request {
            user?: {
                requestId?: string;
                userId?: string;
                organizationId?: string;
                role: string;
                email: string;
            },
            organization?: Organization;
            membership?: Membership;
        }
    }
}

export {};