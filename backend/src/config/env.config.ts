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

    APP_URL: z
        .url("APP_URL must be a valid URL"),
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