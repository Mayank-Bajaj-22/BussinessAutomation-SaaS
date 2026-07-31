import { OrganizationRepository } from "./organization.repository.js";
import { OrganizationService } from "./organization.service.js";

const organizationRepository = new OrganizationRepository();
const organizationService = new OrganizationService(organizationRepository);

export { organizationService };