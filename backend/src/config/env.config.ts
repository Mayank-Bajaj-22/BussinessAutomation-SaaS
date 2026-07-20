import dotenv from "dotenv";
dotenv.config({
    path: "./.env",
});

export const {
    NODE_ENV,
    PORT,
    DATABASE_URL,
} = process.env;

if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is missing.");
}

if (!PORT) {
    throw new Error("PORT is missing.")
}