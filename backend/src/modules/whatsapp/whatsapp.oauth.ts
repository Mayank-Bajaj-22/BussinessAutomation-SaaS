import { randomBytes } from "node:crypto";
import { env } from "../../config/env.config.js";

export class WhatsAppOAuth {
    generateState(): string {
        return randomBytes(32).toString("hex");
    }

    buildAuthorizationUrl(
        state: string,
    ): string {
        const params = new URLSearchParams({
            client_id: env.META_APP_ID,
            redirect_uri: env.META_OAUTH_REDIRECT_URI,
            state,
        });

        return `https://www.facebook.com/${env.WHATSAPP_API_VERSION}/dialog/oauth?${params.toString()}`;
    }
}