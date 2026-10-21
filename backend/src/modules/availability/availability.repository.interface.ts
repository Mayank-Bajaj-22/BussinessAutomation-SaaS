import { AppointmentStatus, DayOfWeek } from "@prisma/client";

export interface IAvailabilityRepository {
    getAvailabilityData(
        organizationId: string,
        serviceId: string,
        dayOfWeek: DayOfWeek,
        dayStart: Date,
        dayEnd: Date,
    ) : Promise<{
        timezone: string;
        organizationHours: {
            openTime: string;
            closeTime: string;
            isClosed: boolean;
        } | null;
        service: {
            id: string;
            name: string;
            durationMinutes: number;
            isActive: boolean;
            staffMembers: {
                staff:{
                    id: string;
                    name: string;
                    isActive: boolean;
                    workingHours: {
                        dayOfWeek: DayOfWeek;
                        isWorking: boolean;
                        startTime: string | null;
                        endTime: string | null;
                        breakStart: string | null;
                        breakEnd: string | null;
                    }[];
                }
            }[];
        } | null;
        appointments: {
            id: string;
            staffId: string;
            startAt: Date;
            endAt: Date;
            status: AppointmentStatus;
        }[];
    }>;
}