import { logger } from "../../../config/logger.js";
import { IncomingMessageContext } from "./incoming-message.types.js";

export class IncomingMessageHandler {
    async handle(
        context: IncomingMessageContext,
    ): Promise<void> {
        logger.info(
            "Handling incoming WhatsApp message",
            {
                messageId: context.message.id,
                organizationId: context.organizationId,
                whatsappAccountId: context.whatsappAccountId,
                contactId: context.contactId,
                conversationId: context.conversationId,
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