import { WhatsAppAccountRepository } from "../account/whatsapp-account.repository.js";
import { ContactRepository } from "./contact.repository.js";
import { ContactService } from "./contact.service.js";

const contactRepository = new ContactRepository();
const whatsappAccountRepository = new WhatsAppAccountRepository();
const contactService = new ContactService(contactRepository, whatsappAccountRepository);

export { contactService };