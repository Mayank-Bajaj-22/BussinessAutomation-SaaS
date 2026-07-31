export interface OrganizationSettingsResponseDTO {
    id: string;
    organizationId: string;
    currency: string;
    language: string;
    timezone: string;
    createdAt: Date,
    updatedAt: Date;
}