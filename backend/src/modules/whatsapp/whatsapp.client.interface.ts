import { WhatsAppMessageResponse, WhatsAppTextMessageRequest } from "./whatsapp.types.js";

export interface IWhatsAppClient {
    sendTextMessage(
        data: WhatsAppTextMessageRequest,
    ) : Promise<WhatsAppMessageResponse>;
}