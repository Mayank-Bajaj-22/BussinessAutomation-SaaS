import crypto from "node:crypto";

export const hashRateLimitKey = (
    value: string,
): string => {
    return crypto
        .createHash("sha256")
        .update(value, "utf8")
        .digest("hex");
};