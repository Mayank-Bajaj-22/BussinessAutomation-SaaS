import { Message } from "@prisma/client";

export interface IncomingMessageContext {
    message: Message;
    organizationId: string;
    whatsappAccountId: string;
    contactId: string;
    conversationId: string;
}