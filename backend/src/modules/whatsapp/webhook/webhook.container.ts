import { prisma } from "../../../lib/prisma.js";
import { WhatsAppAccountRepository } from "../account/whatsapp-account.repository.js";
import { ContactRepository } from "../contact/contact.repository.js";
import { ContactService } from "../contact/contact.service.js";
import { ConversationRepository } from "../conversation/conversation.repository.js";
import { ConversationService } from "../conversation/conversation.service.js";
import { MessageRepository } from "../message/message.repository.js";
import { MessageService } from "../message/message.service.js";
import { WhatsAppClient } from "../whatsapp.client.js";
import { WebhookService } from "./webhook.service.js";

const contactRepository = new ContactRepository();
const conversationRepository = new ConversationRepository();
const messageRepository = new MessageRepository(prisma);
const whatsappClient = new WhatsAppClient();

const whatsappAccountRepository = new WhatsAppAccountRepository();
const contactService = new ContactService(contactRepository, whatsappAccountRepository);
const conversationService = new ConversationService(conversationRepository, whatsappAccountRepository, contactRepository);
const messageService = new MessageService(messageRepository, whatsappAccountRepository, contactService, conversationService, whatsappClient);

const webhookService = new WebhookService(whatsappAccountRepository, contactService, conversationService, messageService);

export { webhookService };