import { Conversation } from "@prisma/client";

export interface ConversationResponse {
    id: string;
    organizationId: string;
    whatsappAccountId: string;
    contactId: string;
    status: Conversation["status"];
    lastMessageAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export function toConversationResponse(
    conversation: Conversation,
): ConversationResponse {
    return {
        id: conversation.id,
        organizationId: conversation.organizationId,
        whatsappAccountId: conversation.whatsappAccountId,
        contactId: conversation.contactId,
        status: conversation.status,
        lastMessageAt: conversation.lastMessageAt,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
    };
}