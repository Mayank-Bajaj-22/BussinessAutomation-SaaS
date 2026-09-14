import { AppError } from "../../common/errors/AppError.js";
import { IWhatsAppClient } from "./whatsapp.client.interface.js";
import { WHATSAPP_API_VERSION, WHATSAPP_GRAPH_API_BASE_URL, WHATSAPP_MESSAGING_PRODUCT, WHATSAPP_RECIPIENT_TYPE, WHATSAPP_TEXT_MESSAGE_TYPE } from "./whatsapp.constants.js";
import { WhatsAppApiErrorResponse, WhatsAppMessageResponse, WhatsAppTextMessageRequest } from "./whatsapp.types.js";

export class WhatsAppClient implements IWhatsAppClient {
    private readonly baseUrl: string;
    private readonly apiVersion: string;

    constructor() {
        this.baseUrl = WHATSAPP_GRAPH_API_BASE_URL;
        this.apiVersion = WHATSAPP_API_VERSION;
    }

    async sendTextMessage(
        data: WhatsAppTextMessageRequest,
    ) : Promise<WhatsAppMessageResponse> {
        const url = 
            `${this.baseUrl}/${this.apiVersion}/${data.phoneNumberId}/messages`;

        let response: Response;

        try {
            response = await fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${data.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messaging_product: WHATSAPP_MESSAGING_PRODUCT,
                    recipient_type: WHATSAPP_RECIPIENT_TYPE,
                    to: data.recipientPhoneNumber,
                    type: WHATSAPP_TEXT_MESSAGE_TYPE,
                    text: {
                        preview_url: false,
                        body: data.body,
                    },
                }),
            });
        } catch (error) {
            throw new AppError(
                "Unable to connect to WhatsApp API.",
                502,
            );
        }

        const responseBody = await this.parseResponse(response);

        if (!response.ok) {
            throw this.createMetaApiError(responseBody, response.status);
        }

        const body = responseBody as {
            messaging_product: string;

            contacts?: Array<{
                input: string;
                wa_id: string;
            }>;

            messages?: Array<{
                id: string;
            }>;
        };

        if (!body.messages?.length) {
            throw new AppError(
                "WhatsApp API did not return a message ID.",
                502,
            );
        }

        return {
            messagingProduct: body.messaging_product,

            contacts: (body.contacts ?? []).map((contact) => ({
                input: contact.input,
                waId: contact.wa_id,
            })),

            messages: body.messages.map((message) => ({
                id: message.id,
            })),
        };
    }

    private async parseResponse(
        response: Response,
    ) : Promise<unknown> {
        const contentType = 
            response.headers.get("content-type");

        if (!contentType?.includes("application/json")) {
            const text = await response.text();

            return {
                raw: text,
            };
        }

        return response.json();
    }

    private createMetaApiError(
        responseBody: unknown,
        statusCode: number,
    ) : AppError {
        const errorBody =
            responseBody as WhatsAppApiErrorResponse;

        const metaError = errorBody.error;

        const message = 
            metaError?.message ?? "WhatsApp API request failed.";

        return new AppError(
            message,
            statusCode,
        );
    }
}