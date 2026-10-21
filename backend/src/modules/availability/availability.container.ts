import { AvailabilityRepository } from "./availability.repository.js";
import { AvailabilityService } from "./availability.service.js";

const availabilityRepository = new AvailabilityRepository();
const availabilityService = new AvailabilityService(availabilityRepository);

export { availabilityService };