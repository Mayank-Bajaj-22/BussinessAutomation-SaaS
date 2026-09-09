import { AppError } from "../../common/errors/AppError.js";
import { IWhatsAppClient } from "./whatsapp.client.interface.js";
import { WHATSAPP_API_VERSION, WHATSAPP_GRAPH_API_BASE_URL } from "./whatsapp.constants.js";
import { WhatsAppApiErrorResponse, WhatsAppMessageResponse, WhatsAppTextMessageRequest } from "./whatsapp.types.js";

export class WhatsAppCLient implements IWhatsAppClient {
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

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${data.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: data.recipientPhoneNumber,
                type: "text",
                text: {
                    preview_url: false,
                    body: data.body,
                },
            }),
        });

        const responseBody = await this.parseResponse(response);

        if (!response.ok) {
            throw this.createMetaApiError(responseBody, response.status);
        }

        return responseBody as WhatsAppMessageResponse;
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