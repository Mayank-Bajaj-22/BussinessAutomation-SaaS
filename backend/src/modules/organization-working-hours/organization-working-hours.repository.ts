import { DayOfWeek, OrganizationWorkingHour, PrismaClient } from "@prisma/client";
import { IOrganizationWorkingHoursRepository } from "./organization-working-hours.repository.interface.js";
import { prisma } from "../../lib/prisma.js";

export class OrganizationWorkingHourRepository implements IOrganizationWorkingHoursRepository {

    constructor(
        private readonly db: PrismaClient = prisma,
    ) {}

    findByOrganizationId(
        organizationId: string
    ): Promise<OrganizationWorkingHour[]> {
        return this.db.organizationWorkingHour.findMany({
            where: {
                organizationId,
            },
            orderBy: {
                dayOfWeek: "asc",
            },
        });
    }

    upsertMany(
        organizationId: string,
        workingHours: {
            dayOfWeek: DayOfWeek;
            openTime: string;
            closeTime: string;
            isClosed: boolean;
        }[],
    ): Promise<OrganizationWorkingHour[]> {
        return this.db.$transaction(async (tx) => {
            for (const workingHour of workingHours) {
                await tx.organizationWorkingHour.upsert({
                    where: {
                        organizationId_dayOfWeek: {
                            organizationId,
                            dayOfWeek: workingHour.dayOfWeek,
                        },
                    },
                    update: {
                        openTime: workingHour.openTime,
                        closeTime: workingHour.closeTime,
                        isClosed: workingHour.isClosed,
                    },
                    create: {
                        organizationId,
                        dayOfWeek: workingHour.dayOfWeek,
                        openTime: workingHour.openTime,
                        closeTime: workingHour.closeTime,
                        isClosed: workingHour.isClosed,
                    },
                });
            }

            return tx.organizationWorkingHour.findMany({
                where: {
                    organizationId,
                },
                orderBy: {
                    dayOfWeek: "asc",
                },
            });
        })
    }
}