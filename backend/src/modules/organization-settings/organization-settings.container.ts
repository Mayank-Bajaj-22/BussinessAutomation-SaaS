import { OrganizationSettingsRepository } from "./organization-settings.repository.js";
import { OrganizationSettingsService } from "./organization-settings.service.js";

const organizationSettingsRepository = new OrganizationSettingsRepository();
const organizationSettingsService = new OrganizationSettingsService(organizationSettingsRepository);

export { organizationSettingsService };