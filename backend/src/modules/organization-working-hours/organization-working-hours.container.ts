import { OrganizationWorkingHourRepository } from "./organization-working-hours.repository.js";
import { OrganizationWorkingHoursService } from "./organization-working-hours.service.js";

const organizationWorkingHoursRepository = new OrganizationWorkingHourRepository();
const organizationWorkingHourService = new OrganizationWorkingHoursService(organizationWorkingHoursRepository);

export { organizationWorkingHourService };