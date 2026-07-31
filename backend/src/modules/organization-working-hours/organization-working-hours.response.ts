export interface OrganizationWorkingHourResponseDTO {
    id: string;
    organizationId: string;
    dayOfWeek: string;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
}

export interface OrganizationWorkingHoursResponseDTO {
    workingHours: OrganizationWorkingHourResponseDTO[];
}