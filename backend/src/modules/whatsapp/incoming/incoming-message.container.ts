import { conversationStateService } from "../conversation-state/conversation-state.container.js";
import { IncomingMessageHandler } from "./incoming-message.handler.js";

export const incomingMessageHandler = new IncomingMessageHandler(conversationStateService);