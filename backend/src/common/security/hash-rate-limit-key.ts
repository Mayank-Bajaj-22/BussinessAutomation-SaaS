import crypto from "crypto";

export const hashRateLimitKey = (
    value: string,
): string => {
    return crypto
        .createHash("sha256")
        .update(value)
        .digest("hex");
};