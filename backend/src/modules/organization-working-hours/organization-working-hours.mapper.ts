import { OrganizationWorkingHour } from "@prisma/client";
import { OrganizationWorkingHourResponseDTO, OrganizationWorkingHoursResponseDTO } from "./organization-working-hours.response.js";

export const toOrganizationWorkingHourResponse = (
    workingHour: OrganizationWorkingHour,
) : OrganizationWorkingHourResponseDTO => {
    return {
        id: workingHour.id,
        organizationId: workingHour.organizationId,
        dayOfWeek: workingHour.dayOfWeek,
        openTime: workingHour.openTime,
        closeTime: workingHour.closeTime,
        isClosed: workingHour.isClosed,
    }
}

export const toOrganizationWorkingHoursResponse = (
    workingHours: OrganizationWorkingHour[],
) : OrganizationWorkingHoursResponseDTO => {
    return {
        workingHours: workingHours.map(
            toOrganizationWorkingHourResponse,
        ),
    };
}