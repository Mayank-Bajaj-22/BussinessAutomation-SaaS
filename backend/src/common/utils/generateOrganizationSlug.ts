import { randomInt } from "node:crypto";
import slugify from "slugify";

const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
const RANDOM_SUFFIX_LENGTH = 6;

function randomSuffix(length = RANDOM_SUFFIX_LENGTH): string {
    let result = "";

    for (let i = 0; i < length; i++) {
        result += CHARS[randomInt(0, CHARS.length)];
    }

    return result;
}

export function generateOrganizationSlug(name: string): string {
    const baseSlug = slugify(name, {
        lower: true,
        strict: true, // removes special characters
        trim: true,
    }) || "organization";

    return `${baseSlug}-${randomSuffix()}`;
}
