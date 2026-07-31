import { AppError } from "../../common/errors/AppError.js";
import { toOrganizationSettingsResponse } from "./organization-settings.mapper.js";
import { IOrganizationSettingsRepository } from "./organization-settings.repository.interface.js";
import { UpdateOrganizationSettingsDTO } from "./organization-settings.schema.js";

export class OrganizationSettingsService {
    constructor(
        private organizationSettingsRepo: IOrganizationSettingsRepository,
    ) {}

    async getCurrentOrganizationSettings(
        organizationId: string,
    ) {
        const settings = 
            await this.organizationSettingsRepo.findByOrganizationId(
                organizationId,
            );

        if (!settings) {
            throw new AppError(
                "Organization settings not found.",
                404,
            );
        }

        return toOrganizationSettingsResponse(settings);
    }

    async updateCurrentOrganizationSettings(
        organizationId: string,
        data: UpdateOrganizationSettingsDTO,
    ) {
        const settings = 
            await this.organizationSettingsRepo.findByOrganizationId(
                organizationId,
            );

        if (!settings) {
            throw new AppError(
                "Organization settings not found.",
                404,
            );
        }

        const updatedSettings =
            await this.organizationSettingsRepo.update(
                organizationId,
                data,
            );

        return toOrganizationSettingsResponse(updatedSettings);
    }
} 