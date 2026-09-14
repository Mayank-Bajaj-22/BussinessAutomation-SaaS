import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({
    path: "./.env",
});

const jwtExpirySchema = z
    .string()
    .regex(
        /^\d+(s|m|h|d|w)$/,
        "JWT expiry must look like 15m, 1h, 7d, or 1w"
    );

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),

    PORT: z.coerce
        .number()
        .int()
        .min(1)
        .max(65535)
        .default(4000),

    APP_URL: z
        .url("APP_URL must be a valid URL"),

    DATABASE_URL: z
        .string()
        .min(1, "DATABASE_URL is required")
        .url("DATABASE_URL must be a valid URL"),

    JWT_ACCESS_TOKEN_SECRET: z
        .string()
        .min(
            32,
            "JWT_ACCESS_TOKEN_SECRET must be at least 32 characters"
        ),

    JWT_REFRESH_TOKEN_SECRET: z
        .string()
        .min(
            32,
            "JWT_REFRESH_TOKEN_SECRET must be at least 32 characters"
        ),

    JWT_ACCESS_TOKEN_EXPIRY: jwtExpirySchema,

    JWT_REFRESH_TOKEN_EXPIRY: jwtExpirySchema,

    REDIS_HOST: z
        .string()
        .min(1, "REDIS_HOST is required"),

    REDIS_PORT: z.coerce
        .number()
        .int()
        .min(1)
        .max(65535)
        .default(6379),

    RESEND_API_KEY: z
        .string()
        .min(1, "RESEND_API_KEY is required"),

    MAIL_FROM: z
        .email("MAIL_FROM must be a valid email address"),

    WHATSAPP_API_VERSION: z
        .string()
        .regex(
            /^v\d+\.\d+$/,
            "WHATSAPP_API_VERSION must look like v23.0",
        ),

    WHATSAPP_GRAPH_API_BASE_URL: z
        .url("WHATSAPP_GRAPH_API_BASE_URL must be a valid URL"),

    WHATSAPP_TOKEN_ENCRYPTION_KEY: z
        .string()
        .regex(
            /^[0-9a-fA-F]{64}$/,
            "WHATSAPP_TOKEN_ENCRYPTION_KEY must be a 32-byte hex key",
        ),

    META_APP_ID: z
        .string()
        .min(1, "META_APP_ID is required"),

    META_APP_SECRET: z
        .string()
        .min(1, "META_APP_SECRET is required"),
    
    META_OAUTH_REDIRECT_URI: z
        .url("META_OAUTH_REDIRECT_URI must be a valid URL"),

    WHATSAPP_WEBHOOK_VERIFY_TOKEN: z
        .string()
        .min(
            32,
            "WHATSAPP_WEBHOOK_VERIFY_TOKEN must be at least 32 characters",
        ),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
    console.error("\nEnvironment validation failed:\n");

    for (const issue of result.error.issues) {
        console.error(
            `  ${issue.path.join(".")}: ${issue.message}`
        );
    }

    console.error("\nServer startup aborted.\n");

    process.exit(1);
}

export const env = result.data;

export type Env = typeof env;