import { DayOfWeek, OrganizationWorkingHour, Prisma } from "@prisma/client";

export interface IOrganizationWorkingHoursRepository {
    findByOrganizationId(
        organizationId: string,
    ) : Promise<OrganizationWorkingHour[]>;

    upsertMany(
        organizationId: string,
        workingHours: {
            dayOfWeek: DayOfWeek;
            openTime: string;
            closeTime: string;
            isClosed: boolean;
        }[],
    ) : Promise<OrganizationWorkingHour[]>;
}