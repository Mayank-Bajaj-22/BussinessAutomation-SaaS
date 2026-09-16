import { Contact } from "@prisma/client";
import { ContactResponse } from "./contact.response.js";

export function mapContactToResponse(
    contact: Contact,
) : ContactResponse {
    return {
        id: contact.id,
        organizationId: contact.organizationId,
        whatsappAccountId: contact.whatsappAccountId,
        phoneNumber: contact.phoneNumber,
        name: contact.name,
        createdAt: contact.createdAt.toISOString(),
        updatedAt: contact.updatedAt.toISOString(),
    };
}

export function mapContactsToResponse(
    contacts: Contact[],
): ContactResponse[] {
    return contacts.map(
        mapContactToResponse,
    );
}