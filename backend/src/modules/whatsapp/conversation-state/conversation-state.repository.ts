import { ConversationIntent, ConversationState, ConversationStep, Prisma } from "@prisma/client";
import { IConversationStateRepository, UpdateConversationStateInput } from "./conversation-state.repository.interface.js";
import { prisma } from "../../../lib/prisma.js";

export class ConversationStateRepository implements IConversationStateRepository {
    async findByConversationId(
        conversationId: string
    ): Promise<ConversationState | null> {
        return prisma.conversationState.findUnique({
            where: {
                conversationId,
            },
        });
    }

    async getOrCreate(
        conversationId: string
    ): Promise<ConversationState> {
        return prisma.conversationState.upsert({
            where: {
                conversationId,
            },
            create: {
                conversationId,
                intent: ConversationIntent.NONE,
                step: ConversationStep.IDLE,
            },
            update: {},
        });
    }

    async updateIfVersionMatches(
        input: UpdateConversationStateInput
    ): Promise<boolean> {
        const data: Prisma.ConversationStateUpdateManyMutationInput = {
            version: {
                increment: 1,
            },
        };

        if (input.intent !== undefined) {
            data.intent = input.intent;
        }

        if (input.step !== undefined) {
            data.step = input.step;
        }

        if (input.context !== undefined) {
            data.context = input.context === null
                ? Prisma.DbNull
                : input.context;
        }

        const result = await prisma.conversationState.updateMany({
            where: {
                conversationId: input.conversationId,
                version: input.expectedVersion,
            },
            data,
        });

        return result.count === 1;
    }
}