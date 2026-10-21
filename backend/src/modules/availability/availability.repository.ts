import {
    AppointmentStatus,
    DayOfWeek,
} from "@prisma/client";

import { prisma } from "../../lib/prisma.js";

import {
    IAvailabilityRepository,
} from "./availability.repository.interface.js";

export class AvailabilityRepository implements IAvailabilityRepository {
    async getAvailabilityData(
        organizationId: string,
        serviceId: string,
        dayOfWeek: DayOfWeek,
        dayStart: Date,
        dayEnd: Date,
    ) {
        const [settings, organizationHours, service] =
            await Promise.all([
                prisma.organizationSettings.findUnique({
                    where: { 
                        organizationId 
                    },
                    select: { 
                        timezone: true 
                    },
                }),

                prisma.organizationWorkingHour.findUnique({
                    where: {
                        organizationId_dayOfWeek: {
                            organizationId,
                            dayOfWeek,
                        },
                    },
                    select: {
                        openTime: true,
                        closeTime: true,
                        isClosed: true,
                    },
                }),

                prisma.service.findFirst({
                    where: {
                        id: serviceId,
                        organizationId,
                    },
                    select: {
                        id: true,
                        name: true,
                        durationMinutes: true,
                        isActive: true,
                        staffMembers: {
                            where: {
                                staff: { 
                                    isActive: true 
                                },
                            },
                            select: {
                                staff: {
                                    select: {
                                        id: true,
                                        name: true,
                                        isActive: true,
                                        workingHours: {
                                            where: { 
                                                dayOfWeek 
                                            },
                                            select: {
                                                dayOfWeek: true,
                                                isWorking: true,
                                                startTime: true,
                                                endTime: true,
                                                breakStart: true,
                                                breakEnd: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                }),
            ]);

        if (!settings) {
            throw new Error(
                "Organization settings are not configured",
            );
        }

        const staffIds =
            service?.staffMembers.map(
                (member) => member.staff.id,
            ) ?? [];

        const appointments = staffIds.length
            ? await prisma.appointment.findMany({
                where: {
                    organizationId,
                    staffId: { 
                        in: staffIds 
                    },
                    status: {
                    in: [
                        AppointmentStatus.PENDING,
                        AppointmentStatus.CONFIRMED,
                    ],
                    },
                    startAt: { lt: dayEnd },
                    endAt: { gt: dayStart },
                },
                select: {
                    id: true,
                    staffId: true,
                    startAt: true,
                    endAt: true,
                    status: true,
                },
                })
            : [];

        return {
            timezone: settings.timezone,
            organizationHours,
            service,
            appointments,
        };
    }
}