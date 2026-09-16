import { contactService } from "./contact/contact.container.js";
import { WhatsAppClient } from "./whatsapp.client.js";
import { WhatsAppRepository } from "./whatsapp.repository.js";
import { WhatsAppService } from "./whatsapp.service.js";

const whatsappRepository = new WhatsAppRepository();
const whatsappClient = new WhatsAppClient();
const whatsappService = new WhatsAppService(whatsappRepository, whatsappClient, contactService);

export { whatsappService };