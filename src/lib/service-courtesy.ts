import { ServiceCourtesyInput } from "@/types/proposal";

export const COURTESY_MESSAGE = "Informe uma cortesia inteira, de 0 até a quantidade do serviço.";
const MAX_COURTESY_QUANTITY = 100000;

type CourtesyService = { id: string; pricingType?: string | null };

type CourtesyLine = {
    pricingType?: string | null;
    unitPrice?: number | null;
    courtesyQuantity?: number | null;
    amount?: number | null;
    service?: { price?: number | null } | null;
};

function money(value: number) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function wholeNumber(raw: string | undefined): number | null {
    const value = (raw ?? "").trim();
    if (!/^\d+$/.test(value)) return null;
    return Number(value);
}

export function wholeGuestNumber(raw: string | number | null | undefined): number | null {
    return wholeNumber(raw == null ? "" : String(raw));
}

export function withoutKey(record: Record<string, string>, key: string): Record<string, string> {
    if (!(key in record)) return record;
    const next = { ...record };
    delete next[key];
    return next;
}

export function courtesyFieldError(raw: string, max: number | null): string | null {
    const value = raw.trim();
    if (!value) return null;
    if (!/^\d+$/.test(value)) return COURTESY_MESSAGE;
    const quantity = Number(value);
    if (quantity > MAX_COURTESY_QUANTITY) return COURTESY_MESSAGE;
    if (max != null && quantity > max) return COURTESY_MESSAGE;
    return null;
}

export function courtesyMax(
    service: CourtesyService,
    hoursInput: Record<string, string>,
    guestNumber: number | null,
): number | null {
    if (service.pricingType === "PER_HOUR") return wholeNumber(hoursInput[service.id]);
    if (service.pricingType === "PER_PERSON") return guestNumber;
    return 1;
}

export function chosenServiceCourtesy(input: {
    services: CourtesyService[];
    selectedIds: string[];
    courtesyInput: Record<string, string>;
    hoursInput: Record<string, string>;
    guestNumber: number | null;
}) {
    const serviceCourtesy: ServiceCourtesyInput[] = [];
    const errors: Record<string, string> = {};
    for (const service of input.services) {
        if (!input.selectedIds.includes(service.id)) continue;
        const raw = input.courtesyInput[service.id] ?? "";
        const message = courtesyFieldError(raw, courtesyMax(service, input.hoursInput, input.guestNumber));
        if (message) {
            errors[service.id] = message;
            continue;
        }
        const quantity = wholeNumber(raw) ?? 0;
        if (quantity > 0) serviceCourtesy.push({ serviceId: service.id, quantity });
    }
    return { serviceCourtesy, errors };
}

export function courtesyInputFromLines(
    lines: { serviceId: string; courtesyQuantity?: number | null }[],
): Record<string, string> {
    const input: Record<string, string> = {};
    for (const line of lines) {
        if (typeof line.courtesyQuantity === "number" && line.courtesyQuantity > 0) {
            input[line.serviceId] = String(line.courtesyQuantity);
        }
    }
    return input;
}

export function courtesyAmount(line: Pick<CourtesyLine, "unitPrice" | "courtesyQuantity">): number {
    const courtesy = line.courtesyQuantity ?? 0;
    if (courtesy <= 0 || typeof line.unitPrice !== "number") return 0;
    return line.unitPrice * courtesy;
}

export function fullServiceAmount(line: CourtesyLine): number {
    const net = line.amount != null ? line.amount : line.service?.price ?? 0;
    return net + courtesyAmount(line);
}

export function courtesyLabel(
    line: Pick<CourtesyLine, "pricingType" | "courtesyQuantity">,
    amount: number,
): string | null {
    const courtesy = line.courtesyQuantity ?? 0;
    if (courtesy <= 0) return null;
    const discount = `(-${money(amount)})`;
    if (line.pricingType === "PER_HOUR") return `Cortesia: ${courtesy}h ${discount}`;
    if (line.pricingType === "PER_PERSON") {
        return `Cortesia: ${courtesy} ${courtesy === 1 ? "pessoa" : "pessoas"} ${discount}`;
    }
    return `Cortesia ${discount}`;
}

export function courtesyDetail(line: Pick<CourtesyLine, "pricingType" | "unitPrice" | "courtesyQuantity">) {
    return courtesyLabel(line, courtesyAmount(line));
}
