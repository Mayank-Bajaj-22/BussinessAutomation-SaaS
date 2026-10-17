import { ConversationIntent, ConversationStep, Prisma } from "@prisma/client";
import { IConversationStateRepository } from "./conversation-state.repository.interface.js";

export class ConversationStateService {
    constructor(
        private readonly conversationStateRepo: IConversationStateRepository,
    ) {}

    async getState(
        conversationId: string,
    ) {
        return this.conversationStateRepo.getOrCreate(
            conversationId,
        );
    }

    async updateState(
        input: {
            conversationId: string;
            expectedVersion: number;
            intent?: ConversationIntent;
            step?: ConversationStep;
            context?: Prisma.InputJsonValue;
        }
    ) {
        const updated = 
            await this.conversationStateRepo.updateIfVersionMatches(
                input,
            );

        if (!updated) {
            throw new Error(
                "Conversation state changed concurrently. Reload and retry.",
            );
        }

        return this.conversationStateRepo.findByConversationId(
            input.conversationId,
        );
    }

    async resetState(
        conversationId: string,
    ) {
        const current = 
            await this.conversationStateRepo.getOrCreate(
                conversationId,
            );

        const updated = 
            await this.conversationStateRepo.updateIfVersionMatches({
                conversationId,
                expectedVersion: current.version,
                intent: ConversationIntent.NONE,
                step: ConversationStep.IDLE,
                context: {},
            });

        if (!updated) {
            throw new Error(
                "Conversation state changed concurrently. Reload and retry.",
            );
        }

        return this.conversationStateRepo.findByConversationId(conversationId);
    }
}