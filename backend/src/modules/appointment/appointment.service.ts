import { AppointmentStatus, Prisma } from "@prisma/client";
import { AppError } from "../../common/errors/AppError.js";
import { IAppointmentRepository } from "./appointment.repository.interface.js";
import { CreateAppointmentDTO, ListAppointmentsQuery, UpdateAppointmentStatusDTO } from "./appointment.types.js";

export class AppointmentService {
    constructor(
        private readonly appointmentRepo: IAppointmentRepository,
    ) {}

    async createAppointment(
        organizationId: string,
        input: CreateAppointmentDTO,  
    ) {
        if (input.idempotencyKey) {
            const existing = 
                await this.appointmentRepo.findByIdempotencyKey(
                    organizationId,
                    input.idempotencyKey,
                );

            if (existing) {
                return existing;
            }
        }

        try {
            return await this.appointmentRepo.create({
                organizationId,
                ...input,
            });
        } catch (error: unknown) {
            if (
                error instanceof Error &&
                error.message === "APPOINTMENT_CONTACT_NOT_FOUND"
            ) {
                throw new AppError(
                    "Contact not found", 
                    404
                );
            }

            if (
                error instanceof Error &&
                error.message === "APPOINTMENT_STAFF_NOT_FOUND"
            ) {
                throw new AppError(
                    "Active staff member not found",
                    404,
                );
            }

            if (
                error instanceof Error &&
                error.message === "APPOINTMENT_STAFF_SERVICE_MISMATCH"
            ) {
                throw new AppError(
                    "This staff member is not assigned to the selected service",
                    400,
                );
            }

            if (
                error instanceof Prisma.PrismaClientKnownRequestError
            ) {
                if (error.code === "P2002" && input.idempotencyKey) {
                    const existing = 
                        await this.appointmentRepo.findByIdempotencyKey(
                            organizationId,
                            input.idempotencyKey,
                        );

                    if (existing) {
                        return existing;
                    }
                }

                if (
                    error.code === "P2004" &&
                    JSON.stringify(error.meta ?? {}).includes(
                        "appointments_staff_no_overlap",
                    )
                ) {
                    throw new AppError(
                        "This staff member already has an overlapping appointment",
                        409,
                    );
                }
            }

            throw error;
        }
    }

    async getAppointment(
        organizationId: string,
        appointmentId: string,
    ) {
        const appointment = await this.appointmentRepo.findById(
            organizationId,
            appointmentId,
        );

        if (!appointment) {
            throw new AppError("Appointment not found", 404);
        }

        return appointment;
    }

    async listAppointments(
        organizationId: string,
        query: ListAppointmentsQuery,
    ) {
        const result = await this.appointmentRepo.list({
            organizationId,
            query,
        });

        return {
            ...result,
            page: query.page,
            limit: query.limit,
            totalPages: Math.ceil(result.total / query.limit),
        };
    }

      async updateAppointmentStatus(
        organizationId: string,
        appointmentId: string,
        input: UpdateAppointmentStatusDTO,
    ) {
        const current = await this.getAppointment(
            organizationId,
            appointmentId,
        );

        const allowedTransitions: Record<
            AppointmentStatus,
            AppointmentStatus[]
        > = {
        PENDING: [
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.CANCELLED,
        ],
        CONFIRMED: [
            AppointmentStatus.CANCELLED,
            AppointmentStatus.COMPLETED,
            AppointmentStatus.NO_SHOW,
        ],
        CANCELLED: [],
        COMPLETED: [],
        NO_SHOW: [],
        };

        if (
            !allowedTransitions[current.status].includes(input.status)
        ) {
            throw new AppError(
                `Cannot transition appointment from ${current.status} to ${input.status}`,
                409,
            );
        }

        if (
            input.status === AppointmentStatus.CANCELLED &&
            !input.cancellationReason
        ) {
            throw new AppError(
                "Cancellation reason is required",
                400,
            );
        }

        const updated = await this.appointmentRepo.updateStatus({
            organizationId,
            appointmentId,
            data: input,
        });

        if (!updated) {
            throw new AppError("Appointment not found", 404);
        }

        return updated;
    }
}