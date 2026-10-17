import { ConversationStateRepository } from "./conversation-state.repository.js";
import { ConversationStateService } from "./conversation-state.service.js";

const conversationStateRepository = new ConversationStateRepository();
const conversationStateService = new ConversationStateService(conversationStateRepository);

export { conversationStateService };