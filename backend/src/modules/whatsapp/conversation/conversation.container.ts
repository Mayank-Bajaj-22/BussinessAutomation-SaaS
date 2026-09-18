import { WhatsAppAccountRepository } from "../account/whatsapp-account.repository.js";
import { ContactRepository } from "../contact/contact.repository.js";
import { ConversationRepository } from "./conversation.repository.js";
import { ConversationService } from "./conversation.service.js";

const conversationRepository = new ConversationRepository();
const whatsappAccountRepository = new WhatsAppAccountRepository();
const contactRepository = new ContactRepository();
const conversationService = new ConversationService(conversationRepository, whatsappAccountRepository, contactRepository);

export { conversationService };