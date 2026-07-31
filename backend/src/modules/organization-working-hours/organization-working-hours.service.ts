import { AppError } from "../../common/errors/AppError.js";
import { prisma } from "../../lib/prisma.js";
import { toOrganizationWorkingHoursResponse } from "./organization-working-hours.mapper.js";
import { IOrganizationWorkingHoursRepository } from "./organization-working-hours.repository.interface.js";
import { UpdateOrganizationWorkingHoursDTO } from "./organization-working-hours.schema.js";

export class OrganizationWorkingHoursService {
    constructor(
        private readonly organizationWorkingHoursRepo: IOrganizationWorkingHoursRepository,
    ) {}

    async getCurrentWorkingHours(
        organizationId: string,
    ) {
        const workingHours = 
            await this.organizationWorkingHoursRepo.findByOrganizationId(organizationId);

        return toOrganizationWorkingHoursResponse(
            workingHours,
        );
    }

    async updateCurrentWorkingHours(
        organizationId: string,
        data: UpdateOrganizationWorkingHoursDTO,
    ) {
        if (data.workingHours.length !== 7) {
            throw new AppError(
                "Exactly 7 working days are required.",
                400,
            );
        }

        const uniqueDays = new Set(
            data.workingHours.map(
                (item) => item.dayOfWeek,
            ),
        );

        if (uniqueDays.size !== 7) {
            throw new AppError(
                "Duplicate dayOfWeek found.",
                400,
            );
        }

        const workingHours =
            await this.organizationWorkingHoursRepo.upsertMany(
                organizationId,
                data.workingHours,
            );

        return toOrganizationWorkingHoursResponse(
            workingHours,
        );
    }
}