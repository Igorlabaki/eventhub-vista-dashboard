import { ServicePricingType } from "@/types/service";
import { ProposalService } from "@/types/proposal";
import { serviceHourFieldError } from "@/lib/event-duration";

export function serviceUnitLabel(price: number, pricingType?: ServicePricingType | null) {
    const money = price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    if (pricingType === "PER_HOUR") return `${money}/hora`;
    if (pricingType === "PER_PERSON") return `${money}/pessoa`;
    return money;
}

export function quotedServiceAmount(line: Pick<ProposalService, "amount" | "service">) {
    if (line.amount != null) return line.amount;
    return line.service?.price ?? 0;
}

const PRICING_RANK: Record<string, number> = {
    FIXED: 0,
    PER_HOUR: 1,
    PER_PERSON: 2,
};

type PricedServiceLine = {
    pricingType?: string | null;
    service?: { pricingType?: string | null } | null;
};

export function proposalServicePricingRank(line: PricedServiceLine) {
    const type = line.pricingType ?? line.service?.pricingType ?? "FIXED";
    return PRICING_RANK[type] ?? PRICING_RANK.FIXED;
}

export function sortProposalServicesByPricing<T extends PricedServiceLine>(lines: T[]): T[] {
    return [...lines].sort((a, b) => proposalServicePricingRank(a) - proposalServicePricingRank(b));
}

export function chosenHoursLabel(
    pricingType: string | null | undefined,
    quantity: number | null | undefined,
) {
    if (pricingType !== "PER_HOUR") return null;
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) return null;
    return quantity === 1 ? "1 hora." : `${quantity} horas.`;
}

export function publicHourlyRate(input: {
    hourly?: boolean;
    amount: number;
    hours?: number | null;
    eventHours: number;
    unitPrice?: number | null;
    catalogPrice?: number | null;
}) {
    if (!input.hourly) return null;
    if (typeof input.unitPrice === "number" && Number.isFinite(input.unitPrice)) return input.unitPrice;
    if (typeof input.catalogPrice === "number" && Number.isFinite(input.catalogPrice)) return input.catalogPrice;
    if (input.hours == null && input.eventHours > 0) return input.amount / input.eventHours;
    if (typeof input.hours === "number" && input.hours > 0) return input.amount / input.hours;
    return null;
}

export function hourlyChoiceAmount(
    rate: number | null | undefined,
    rawHours: string,
    eventHours: number,
    courtesyHours = 0,
) {
    if (typeof rate !== "number" || !Number.isFinite(rate)) return null;
    const value = rawHours.trim();
    if (!value || serviceHourFieldError(value, eventHours)) return null;
    return rate * Math.max(Number(value) - courtesyHours, 0);
}

export function quotedServiceDetail(line: Pick<ProposalService, "amount" | "quantity" | "unitPrice" | "pricingType">) {
    if (line.amount == null || !line.pricingType || line.pricingType === "FIXED") return null;
    if (line.unitPrice == null || line.quantity == null) return null;
    const unit = line.unitPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const suffix = line.pricingType === "PER_HOUR" ? "h" : "pessoas";
    return `${unit} × ${line.quantity} ${suffix}`;
}
