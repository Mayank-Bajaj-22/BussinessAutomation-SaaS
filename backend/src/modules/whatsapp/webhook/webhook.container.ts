import { prisma } from "../../../lib/prisma.js";
import { WhatsAppAccountRepository } from "../account/whatsapp-account.repository.js";
import { ContactRepository } from "../contact/contact.repository.js";
import { ContactService } from "../contact/contact.service.js";
import { ConversationRepository } from "../conversation/conversation.repository.js";
import { ConversationService } from "../conversation/conversation.service.js";
import { IncomingMessageHandler } from "../incoming/incoming-message.handler.js";
import { MessageRepository } from "../message/message.repository.js";
import { MessageService } from "../message/message.service.js";
import { WhatsAppClient } from "../whatsapp.client.js";
import { WebhookEventRepository } from "./webhook-event.repository.js";
import { WebhookEventService } from "./webhook-event.service.js";
import { WebhookService } from "./webhook.service.js";

const contactRepository = new ContactRepository();
const conversationRepository = new ConversationRepository();
const messageRepository = new MessageRepository(prisma);
const whatsappClient = new WhatsAppClient();
const webhookEventRepository = new WebhookEventRepository(prisma);
const incomingMessageHandler = new IncomingMessageHandler();

const whatsappAccountRepository = new WhatsAppAccountRepository();
const contactService = new ContactService(contactRepository, whatsappAccountRepository);
const conversationService = new ConversationService(conversationRepository, whatsappAccountRepository, contactRepository);
const messageService = new MessageService(messageRepository, whatsappAccountRepository, contactService, conversationService, whatsappClient);
const webhookEventService = new WebhookEventService(webhookEventRepository);

const webhookService = new WebhookService(whatsappAccountRepository, contactService, conversationService, messageService, webhookEventService, incomingMessageHandler);

export { webhookService, webhookEventService, webhookEventRepository };