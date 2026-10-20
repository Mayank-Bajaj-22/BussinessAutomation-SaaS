import { Appointment } from "@prisma/client";
import { CreateAppointmentDTO, ListAppointmentsQuery, UpdateAppointmentStatusDTO } from "./appointment.types.js";

export interface ICreateAppointmentData extends CreateAppointmentDTO {
    organizationId: string;
}

export interface IListAppointmentsInput {
    organizationId: string;
    query: ListAppointmentsQuery;
}

export interface IUpdateAppointmentStatusData {
    organizationId: string;
    appointmentId: string;
    data: UpdateAppointmentStatusDTO;
}

export interface IAppointmentRepository {
    create(data: ICreateAppointmentData): Promise<Appointment>;
    findById(organizationId: string, appointmentId: string): Promise<Appointment | null>;
    findByIdempotencyKey(organizationId: string, idempotencyKey: string): Promise<Appointment | null>;
    list(input: IListAppointmentsInput): Promise<{ items: Appointment[]; total: number }>;
    updateStatus(data: IUpdateAppointmentStatusData): Promise<Appointment | null>;
}