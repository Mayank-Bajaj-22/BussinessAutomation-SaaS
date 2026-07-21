import dotenv from "dotenv";
dotenv.config({
    path: "./.env",
});

export const {
    NODE_ENV,
    PORT,
    DATABASE_URL,
    JWT_ACCESS_TOKEN_SECRET,
    JWT_REFRESH_TOKEN_SECRET,
    JWT_ACCESS_TOKEN_EXPIRY,
    JWT_REFRESH_TOKEN_EXPIRY
} = process.env;

if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is missing.");
}

if (!PORT) {
    throw new Error("PORT is missing.");
}

if (!JWT_ACCESS_TOKEN_SECRET) {
    throw new Error("JWT_ACCESS_TOKEN_SECRET is missing.");
}

if (!JWT_REFRESH_TOKEN_SECRET) {
    throw new Error("JWT_REFRESH_TOKEN_SECRET is missing.");
}

if (!JWT_ACCESS_TOKEN_EXPIRY) {
    throw new Error("JWT_ACCESS_TOKEN_EXPIRY is missing.");
}

if (!JWT_REFRESH_TOKEN_EXPIRY) {
    throw new Error("JWT_REFRESH_TOKEN_EXPIRY is missing.");
}