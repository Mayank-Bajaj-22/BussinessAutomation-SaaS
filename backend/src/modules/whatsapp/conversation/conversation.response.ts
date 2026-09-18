import { Conversation } from "@prisma/client";
import { toConversationResponse } from "./conversation.mapper.js";

export function conversationResponse(
    conversation: Conversation,
) {
    return toConversationResponse(
        conversation,
    );
}

export function conversationListResponse(
    conversations: Conversation[],
    page: number,
    limit: number,
    total: number,
) {
    const totalPages = Math.ceil(total / limit);

    return {
        conversations: conversations.map(
            toConversationResponse,
        ),

        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
    };
}