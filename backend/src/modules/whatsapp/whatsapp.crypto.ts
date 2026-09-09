import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { AppError } from "../../common/errors/AppError.js";
import { env } from "../../config/env.config.js";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
    const key = Buffer.from(
        env.WHATSAPP_TOKEN_ENCRYPTION_KEY,
        "hex",
    );

    if (key.length !== 32) {
        throw new AppError(
            "WhatsApp token encryption key must be exactly 32 bytes.",
            500,
        );
    }

    return key;
}

export function encryptWhatsAppToken(
    token: string,
): string {
    if (!token) {
        throw new AppError(
            "WhatsApp access token cannot be empty.",
            500,
        );
    }

    const key = getEncryptionKey();

    const iv = randomBytes(IV_LENGTH);

    const cipher = createCipheriv(
        ALGORITHM,
        key,
        iv,
    );

    const encrypted = Buffer.concat([
        cipher.update(token, "utf-8"),
        cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    /*
     * Store one encoded value:
     *
     * IV : AUTH_TAG : CIPHERTEXT
     */

    return [
        iv.toString("hex"),
        authTag.toString("hex"),
        encrypted.toString("hex"),
    ].join(":");
}

export function decryptWhatsAppToken(
    encryptedToken: string,
) : string {
    if (!encryptedToken) {
        throw new AppError(
            "Encrypted WhatsApp token is missing.",
            500,
        );
    }

    const key = getEncryptionKey();

    const parts = encryptedToken.split(":");

    if (parts.length !== 3) {
        throw new AppError(
            "Invalid encrypted WhatsApp token format.",
            500,
        );
    }

    const [
        ivHex,
        authTagHex,
        encryptedHex,
    ] = parts;

    try {
        const iv = Buffer.from(ivHex, "hex");
        const authTag = Buffer.from(
            authTagHex,
            "hex",
        );
        const encrypted = Buffer.from(
            encryptedHex,
            "hex",
        );

        if (iv.length !== IV_LENGTH) {
            throw new Error("Invalid IV length.");
        }

        if (authTag.length !== AUTH_TAG_LENGTH) {
            throw new Error("Invalid authentication tag length.");
        }

        const decipher = createDecipheriv(
            ALGORITHM,
            key,
            iv,
        );

        decipher.setAuthTag(authTag);

        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final(),
        ]);

        return decrypted.toString("utf8");
    } catch {
        throw new AppError(
            "Unable to decrypt WhatsApp access token.",
            500,
        );
    }
}