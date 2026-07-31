import { OrganizationSettings } from "@prisma/client";
import { OrganizationSettingsResponseDTO } from "./organization-settings.response.js";


export const toOrganizationSettingsResponse = (
    settings: OrganizationSettings,
) : OrganizationSettingsResponseDTO => {
    return {
        id: settings.id,
        organizationId: settings.organizationId,
        currency: settings.currency,
        language: settings.language,
        timezone: settings.timezone,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt,
    }
}