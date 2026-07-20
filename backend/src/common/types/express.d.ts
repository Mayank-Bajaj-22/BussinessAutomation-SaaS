declare global {
    namespace Express {
        interface Request {
            requestId: string;
            userId?: string;
            organizationId?: string;
        }
    }
}

export {};