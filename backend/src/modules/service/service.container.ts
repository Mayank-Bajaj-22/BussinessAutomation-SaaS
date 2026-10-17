import { ServiceRepository } from "./service.repository.js";
import { ServiceService } from "./service.service.js";

const serviceRepository = new ServiceRepository();
const serviceService = new ServiceService(serviceRepository);

export { serviceService };