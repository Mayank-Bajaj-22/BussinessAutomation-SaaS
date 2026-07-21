import slugify from "slugify";

const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

function randomSuffix(length = 4): string {
    let result = "";

    for (let i = 0; i < length; i++) {
        result += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    return result;
}

export function generateOrganizationSlug(name: string): string {
    const baseSlug = slugify(name, {
        lower: true,
        strict: true, // removes special characters
        trim: true,
    });

    return `${baseSlug}-${randomSuffix()}`;
}
