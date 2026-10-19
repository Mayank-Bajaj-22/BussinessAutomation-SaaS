import { StaffRepository } from "./staff.repository.js";
import { StaffService } from "./staff.service.js";

const staffRepository = new StaffRepository();
const staffService = new StaffService(staffRepository);

export { staffService };