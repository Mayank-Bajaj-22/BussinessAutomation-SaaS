import { AsyncLocalStorage } from "node:async_hooks";

export interface RequestContext {
    requestId: string;
    userId?: string;
    organizationId?: string;
    membershipId?: string;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

export const getRequestContext = (): RequestContext | undefined => {
    return requestContext.getStore();
}

export const updateRequestContext = (
    updates: Partial<RequestContext>,
): void => {
    const context = requestContext.getStore();

    if (!context) {
        return;
    }

    Object.assign(context, updates);
}