import { Prisma, Appointment } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";

import {
    IAppointmentRepository,
    ICreateAppointmentData,
    IListAppointmentsInput,
    IUpdateAppointmentStatusData,
} from "./appointment.repository.interface.js";

export class AppointmentRepository implements IAppointmentRepository {
    async create(
        data: ICreateAppointmentData,
    ): Promise<Appointment> {
        const startAt = new Date(data.startAt);

        return prisma.$transaction(async (tx) => {
            const [contact, service, staff] = await Promise.all([
                tx.contact.findFirst({
                    where: {
                        id: data.contactId,
                        organizationId: data.organizationId,
                    },
                }),

                tx.service.findFirst({
                    where: {
                        id: data.serviceId,
                        organizationId: data.organizationId,
                        isActive: true,
                    },
                }),

                tx.staff.findFirst({
                    where: {
                        id: data.staffId,
                        organizationId: data.organizationId,
                        isActive: true,
                    },
                }),
            ]);

            if (!contact) {
                throw new Error("APPOINTMENT_CONTACT_NOT_FOUND");
            }

            if (!service) {
                throw new Error("APPOINTMENT_SERVICE_NOT_FOUND");
            }

            if (!staff) {
                throw new Error("APPOINTMENT_STAFF_NOT_FOUND");
            }

            const assignment = await tx.staffService.findUnique({
                where: {
                    staffId_serviceId: {
                        staffId: data.staffId,
                        serviceId: data.serviceId,
                    },
                },
            });

            if (!assignment) {
                throw new Error("APPOINTMENT_STAFF_SERVICE_MISMATCH");
            }

            const endAt = new Date(
                startAt.getTime() + service.durationMinutes * 60_000,
            );

            return tx.appointment.create({
                data: {
                    organizationId: data.organizationId,
                    contactId: data.contactId,
                    serviceId: service.id,
                    staffId: staff.id,

                    startAt,
                    endAt,

                    serviceName: service.name,
                    durationMinutes: service.durationMinutes,
                    price: service.price,

                    customerNote: data.customerNote ?? null,
                    idempotencyKey: data.idempotencyKey ?? null,

                    status: "PENDING",
                },
            });
        });
    }

    async findById(
        organizationId: string,
        appointmentId: string,
    ): Promise<Appointment | null> {
        return prisma.appointment.findFirst({
            where: {
                id: appointmentId,
                organizationId,
            },
        });
    }

    async findByIdempotencyKey(
        organizationId: string,
        idempotencyKey: string,
    ): Promise<Appointment | null> {
        return prisma.appointment.findUnique({
            where: {
                organizationId_idempotencyKey: {
                    organizationId,
                    idempotencyKey,
                },
            },
        });
    }

    async list(input: IListAppointmentsInput): Promise<{
        items: Appointment[];
        total: number;
    }> {
        const { organizationId, query } = input;

        const where: Prisma.AppointmentWhereInput = {
            organizationId,

            ...(query.status ? { status: query.status } : {}),
            ...(query.staffId ? { staffId: query.staffId } : {}),
            ...(query.contactId ? { contactId: query.contactId } : {}),

            ...(query.from || query.to
                ? {
                    startAt: {
                    ...(query.from
                        ? { gte: new Date(query.from) }
                        : {}),
                    ...(query.to
                        ? { lte: new Date(query.to) }
                        : {}),
                    },
                }
                : {}),
            };

        const [items, total] = await prisma.$transaction([
            prisma.appointment.findMany({
                where,
                orderBy: { startAt: "asc" },
                skip: (query.page - 1) * query.limit,
                take: query.limit,
            }),

            prisma.appointment.count({ where }),
        ]);

        return { items, total };
    }

    async updateStatus(
        data: IUpdateAppointmentStatusData,
    ): Promise<Appointment | null> {
        const result = await prisma.appointment.updateMany({
            where: {
                id: data.appointmentId,
                organizationId: data.organizationId,
            },
            data: {
                status: data.data.status,
                ...(data.data.status === "CANCELLED"
                    ? {
                        cancellationReason:
                            data.data.cancellationReason ?? null,
                        }
                    : {}),
            },
        });

        if (result.count === 0) {
            return null;
        }

        return this.findById(
            data.organizationId,
            data.appointmentId,
        );
    }
}