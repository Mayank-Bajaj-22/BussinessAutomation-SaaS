import { AppointmentRepository } from "./appointment.repository.js";
import { AppointmentService } from "./appointment.service.js";

const appointmentRepository = new AppointmentRepository();
const appointmentService = new AppointmentService(appointmentRepository);

export { appointmentService };