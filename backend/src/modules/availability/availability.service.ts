import { DayOfWeek } from "@prisma/client";
import { IAvailabilityRepository } from "./availability.repository.interface.js";
import { getDayOfWeek, localTimeToUtc, minutesToTime, timeToMinutes } from "./availability.helper.js";
import { AppError } from "../../common/errors/AppError.js";

interface GetAvailabilityInput {
    organizationId: string;
    serviceId: string;
    date: string;
}

export class AvailabilityService {
    constructor(
        private readonly availabilityRepo : IAvailabilityRepository,
    ) {}

    async getAvailableSlots(input: GetAvailabilityInput) {
        const { organizationId, serviceId, date } = input;

        const dayOfWeek: DayOfWeek = getDayOfWeek(date);

        const data = 
            await this.availabilityRepo.getAvailabilityData(
                organizationId,
                serviceId,
                dayOfWeek,
                new Date(`${date}T00:00:00.000Z`),
                new Date(`${date}T23:59:59.999Z`),
            );

        const { timezone, organizationHours, service, appointments } = data;
        
        if (!service || !service.isActive) {
            throw new AppError(
                "Service not found or inactive",
                404,
            );
        }

        if (!organizationHours || !organizationHours.isClosed) {
            return {
                date,
                timezone,
                service: {
                    id: service.id,
                    name: service.name,
                    durationMinutes: service.durationMinutes,
                },
                slots: [],
            };
        }

        const orgOpen = timeToMinutes(
            organizationHours.openTime,
        );

        const orgClose = timeToMinutes(
            organizationHours.closeTime,
        );

        if (orgClose <= orgOpen) {
            throw new AppError(
                "Invalid organization working hours",
                500,
            );
        }

        const now = new Date();

        const slots: {
            staffId: string;
            staffName: string;
            startAt: string;
            endAt: string;
            localStartTime: string;
            localEndTime: string;
        }[] = [];

        for (const member of service.staffMembers) {
            const staff = member.staff;

            if (!staff.isActive) continue;

            const schedule = staff.workingHours[0];

            if (!schedule || !schedule.isWorking || !schedule.startTime || !schedule.endTime) {
                continue;
            }

            const staffOpen = timeToMinutes(
                schedule.startTime,
            );

            const staffClose = timeToMinutes(
                schedule.endTime,
            );

            if (staffClose <= staffOpen) continue;

            const availableStart = Math.max(
                orgOpen,
                staffOpen,
            );

            const availableEnd = Math.min(
                orgClose,
                staffClose,
            );

            const breakStart = schedule.breakStart
                ? timeToMinutes(schedule.breakStart)
                : null;

            const breakEnd = schedule.breakEnd
                ? timeToMinutes(schedule.breakEnd)
                : null;

            const staffAppointments = appointments.filter(
                (appointment) =>
                appointment.staffId === staff.id,
            );

            for (
                let startMinute = availableStart;
                startMinute + service.durationMinutes <=
                availableEnd;
                startMinute += 15
            ) {
                const endMinute =
                    startMinute + service.durationMinutes;

                // Reject slots that overlap the staff break.
                if (
                    breakStart !== null &&
                    breakEnd !== null &&
                    startMinute < breakEnd &&
                    endMinute > breakStart
                ) {
                    continue;
                }

                const localStart = minutesToTime(startMinute);
                const localEnd = minutesToTime(endMinute);

                const startAt = localTimeToUtc(
                    date,
                    localStart,
                    timezone,
                );

                const endAt = localTimeToUtc(
                    date,
                    localEnd,
                    timezone,
                );

                // Do not return past slots.
                if (startAt <= now) continue;

                // Overlap test: [startAt, endAt)
                const hasConflict = staffAppointments.some(
                    (appointment) =>
                        startAt < appointment.endAt &&
                        endAt > appointment.startAt,
                    );

                if (hasConflict) continue;

                slots.push({
                    staffId: staff.id,
                    staffName: staff.name,
                    startAt: startAt.toISOString(),
                    endAt: endAt.toISOString(),
                    localStartTime: localStart,
                    localEndTime: localEnd,
                });
            }
        }

        slots.sort(
            (a, b) =>
                new Date(a.startAt).getTime() -
                new Date(b.startAt).getTime(),
            );

        return {
            date,
            timezone,
            service: {
                id: service.id,
                name: service.name,
                durationMinutes: service.durationMinutes,
            },
            slots,
        };
    }
}