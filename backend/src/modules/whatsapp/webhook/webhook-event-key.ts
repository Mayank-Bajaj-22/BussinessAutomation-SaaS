export const createMessageEventKey = (
    providerMessageId: string,
) => {
    return `message:${providerMessageId}`;
};

export const createStatusEventKey = (
    providerMessageId: string,
    status: string,
) => {
    return `status:${providerMessageId}:${status}`;
};