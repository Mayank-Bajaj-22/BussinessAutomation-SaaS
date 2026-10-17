import { logger } from "../../../config/logger.js";
import { ConversationStateService } from "../conversation-state/conversation-state.service.js";
import { IncomingMessageContext } from "./incoming-message.types.js";

export class IncomingMessageHandler {
    constructor(
        private readonly conversationStateService: ConversationStateService,
    ) {}
    async handle(
        context: IncomingMessageContext,
    ): Promise<void> {
        const state = 
            await this.conversationStateService.getState(
                context.conversationId,
            );
        
        logger.info(
            "Incoming WhatsApp message received with conversation state",
            {
                messageId: context.message.id,
                organizationId: context.organizationId,
                conversationId: context.conversationId,
                intent: state.intent,
                step: state.step,
                version: state.version,
            },
        );

        /*
            * Business logic will be connected here.
            *
            * Future:
            *
            * 1. Determine conversation state
            * 2. Detect intent
            * 3. Start booking flow
            * 4. Continue existing booking flow
            * 5. Handle cancellation
            * 6. Handle rescheduling
            * 7. Send response
        */
    }
};