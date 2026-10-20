import { Appointment } from "@prisma/client";

export const toAppointmentResponse = (
    appointment: Appointment,
) => ({
    id: appointment.id,
    organizationId: appointment.organizationId,
    contactId: appointment.contactId,
    serviceId: appointment.serviceId,
    staffId: appointment.staffId,

    status: appointment.status,

    startAt: appointment.startAt.toISOString(),
    endAt: appointment.endAt.toISOString(),

    serviceName: appointment.serviceName,
    durationMinutes: appointment.durationMinutes,
    price: appointment.price.toFixed(2),

    customerNote: appointment.customerNote,
    cancellationReason: appointment.cancellationReason,

    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
});