import { ConversationIntent, ConversationState, ConversationStep, Prisma } from "@prisma/client";

export interface UpdateConversationStateInput {
    conversationId: string;
    expectedVersion: number;
    intent?: ConversationIntent;
    step?: ConversationStep;
    context?: Prisma.InputJsonValue | null;
}

export interface IConversationStateRepository {
    findByConversationId(conversationId: string): Promise<ConversationState | null>;
    getOrCreate(conversationId: string): Promise<ConversationState>;
    updateIfVersionMatches(input: UpdateConversationStateInput): Promise<boolean>;
}