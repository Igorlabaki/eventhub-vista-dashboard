export const SERVICE_HOURS_MESSAGE = "Informe um número inteiro de horas para o serviço.";
const MAX_SERVICE_HOURS = 8760;

export function serviceHoursOverEventMessage(eventHours: number): string {
    const unit = eventHours === 1 ? "hora" : "horas";
    return `O serviço não pode ter mais horas do que o evento (${eventHours} ${unit}).`;
}

export function serviceHourFieldError(raw: string, eventHours: number | null): string | null {
    const value = raw.trim();
    if (!value) return null;
    if (!/^\d+$/.test(value)) return SERVICE_HOURS_MESSAGE;
    const hours = Number(value);
    if (hours < 1 || hours > MAX_SERVICE_HOURS) return SERVICE_HOURS_MESSAGE;
    if (eventHours != null && hours > eventHours) return serviceHoursOverEventMessage(eventHours);
    return null;
}

function minutesOf(hour: string): number | null {
    const [hours, minutes] = hour.split(":").map(Number);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
    return hours * 60 + minutes;
}

export function sameDayEventHours(day: string, startHour: string, endHour: string): number | null {
    if (!day || !startHour || !endHour) return null;
    const startMinutes = minutesOf(startHour);
    const endMinutes = minutesOf(endHour);
    if (startMinutes == null || endMinutes == null || endMinutes <= startMinutes) return null;
    return eventDurationHours(wallClockDate(day, startHour), wallClockDate(day, endHour));
}

export function stayEventHours(startDay: string, endDay: string, checkIn: string, checkOut: string): number | null {
    if (!startDay || !endDay) return null;
    return eventDurationHours(
        wallClockDate(startDay, checkIn || "14:00"),
        wallClockDate(endDay, checkOut || "12:00"),
    );
}

export function eventDurationHours(startDate: Date, endDate: Date): number {
    if (endDate.getTime() < startDate.getTime()) {
        const nextDayEndDate = new Date(endDate);
        nextDayEndDate.setDate(nextDayEndDate.getDate() + 1);
        return Math.floor((nextDayEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
    }
    return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
}

export function wallClockDate(day: string, hour: string): Date {
    const [year, month, date] = day.split("-").map(Number);
    const [hours, minutes] = hour.split(":").map(Number);
    return new Date(year, (month || 1) - 1, date || 1, hours || 0, minutes || 0, 0, 0);
}

type HourlyService = { id: string; pricingType?: string | null };

export function chosenServiceHours(
    services: HourlyService[],
    selectedIds: string[],
    rawHours: Record<string, string>,
    eventHours: number | null = null,
) {
    const serviceHours: { serviceId: string; hours: number }[] = [];
    const errors: Record<string, string> = {};
    for (const service of services) {
        if (service.pricingType !== "PER_HOUR" || !selectedIds.includes(service.id)) continue;
        const raw = (rawHours[service.id] ?? "").trim();
        if (!raw) {
            errors[service.id] = SERVICE_HOURS_MESSAGE;
            continue;
        }
        const message = serviceHourFieldError(raw, eventHours);
        if (message) {
            errors[service.id] = message;
            continue;
        }
        serviceHours.push({ serviceId: service.id, hours: Number(raw) });
    }
    return { serviceHours, errors };
}

export function durationServiceHours(
    services: HourlyService[],
    selectedIds: string[],
    startDate: Date,
    endDate: Date,
) {
    const hours = eventDurationHours(startDate, endDate);
    return services
        .filter((service) => service.pricingType === "PER_HOUR" && selectedIds.includes(service.id))
        .map((service) => ({ serviceId: service.id, hours }));
}
