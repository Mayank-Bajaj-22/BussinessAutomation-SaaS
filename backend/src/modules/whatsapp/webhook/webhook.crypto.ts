import { AppError } from "../../../common/errors/AppError.js";
import { env } from "../../../config/env.config.js";
import crypto from "node:crypto";

export const verifyWhatsAppWebhookSignature = (
    rawBody: Buffer,
    signatureHeader: string | undefined,
) : boolean => {
    if (!signatureHeader) {
        return false;
    }

    const appSecret = env.META_APP_SECRET;

    if (!appSecret) {
        throw new AppError(
            "Meta app secret is not configured",
            500,
        );
    }

    const expectedSignature = "sha256=" + crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature);
    const actualBuffer = Buffer.from(signatureHeader);

    if (expectedBuffer.length !== actualBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(
        expectedBuffer,
        actualBuffer,
    );
}