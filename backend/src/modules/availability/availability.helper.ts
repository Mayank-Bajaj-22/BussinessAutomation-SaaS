import { DayOfWeek } from "@prisma/client";
import { fromZonedTime } from "date-fns-tz";

const DAY_MAP: Record<number, DayOfWeek> = {
    0: DayOfWeek.SUNDAY,
    1: DayOfWeek.MONDAY,
    2: DayOfWeek.TUESDAY,
    3: DayOfWeek.WEDNESDAY,
    4: DayOfWeek.THURSDAY,
    5: DayOfWeek.FRIDAY,
    6: DayOfWeek.SATURDAY,
};

export function getDayOfWeek(date: string): DayOfWeek {
    const [year, month, day] = date.split("-").map(Number);

    const utcDate = new Date(
        Date.UTC(year, month - 1, day),
    );

    return DAY_MAP[utcDate.getUTCDay()];
}

export function localTimeToUtc(
    date: string,
    time: string,
    timezone: string,
): Date {
    return fromZonedTime(
        `${date}T${time}:00`,
        timezone,
    );
}

export function timeToMinutes(time: string): number {
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);

    if (!match) {
        throw new Error(`Invalid time format: ${time}`);
    }

    return Number(match[1]) * 60 + Number(match[2]);
}

export function minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}