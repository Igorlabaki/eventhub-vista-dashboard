import { chosenServiceHours, sameDayEventHours } from "@/lib/event-duration";
import { ProposalQuoteInput, ProposalType } from "@/types/proposal";

type QuoteFormValues = {
    venueId: string;
    date?: string | null;
    startHour?: string | null;
    endHour?: string | null;
    guestNumber?: string | null;
    type: ProposalType;
    services: { id: string; pricingType?: string | null }[];
    selectedServiceIds: string[];
    serviceHoursInput: Record<string, string>;
};

export function buildQuoteInput(values: QuoteFormValues): ProposalQuoteInput | null {
    const { venueId, date, startHour, endHour } = values;
    if (!venueId || !date || !startHour || !endHour) return null;

    const eventHours = sameDayEventHours(date, startHour, endHour);
    if (eventHours == null) return null;

    const guestNumber = Number(values.guestNumber);
    if (!Number.isInteger(guestNumber) || guestNumber < 1) return null;

    const { serviceHours, errors } = chosenServiceHours(
        values.services,
        values.selectedServiceIds,
        values.serviceHoursInput,
        eventHours,
    );
    if (Object.keys(errors).length > 0) return null;

    return {
        venueId,
        date,
        startHour,
        endHour,
        guestNumber,
        serviceIds: values.selectedServiceIds,
        serviceHours,
        type: values.type,
    };
}
