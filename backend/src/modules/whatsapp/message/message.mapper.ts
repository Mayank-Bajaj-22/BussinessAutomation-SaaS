import { Message } from "@prisma/client";

export const toMessageResponse = (message: Message) => {
    return {
        id: message.id,
        conversationId: message.conversationId,
        providerMessageId: message.providerMessageId,
        direction: message.direction,
        type: message.type,
        body: message.body,
        status: message.status,
        messageTimestamp: message.messageTimestamp,
        createdAt: message.createdAt,
    };
};