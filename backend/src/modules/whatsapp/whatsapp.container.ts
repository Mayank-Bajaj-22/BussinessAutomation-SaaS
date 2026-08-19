import { WhatsAppRepository } from "./whatsapp.repository.js";
import { WhatsAppService } from "./whatsapp.service.js";

const whatsappRepository = new WhatsAppRepository();
const whatsappService = new WhatsAppService(whatsappRepository);

export { whatsappService };