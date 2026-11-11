import { describe, expect, it } from "vitest";
import { ProposalType } from "@/types/proposal";
import { buildQuoteInput } from "./proposal-quote-input";

const filled = {
    venueId: "venue-1",
    date: "2026-12-12",
    startHour: "19:00",
    endHour: "23:00",
    guestNumber: "100",
    type: ProposalType.EVENT,
    services: [
        { id: "limpeza", pricingType: "FIXED" },
        { id: "led", pricingType: "PER_HOUR" },
    ],
    selectedServiceIds: ["limpeza"],
    serviceHoursInput: {},
};

describe("entrada da cotacao do orcamento", () => {
    it("monta a entrada com os campos preenchidos", () => {
        expect(buildQuoteInput(filled)).toEqual({
            venueId: "venue-1",
            date: "2026-12-12",
            startHour: "19:00",
            endHour: "23:00",
            guestNumber: 100,
            serviceIds: ["limpeza"],
            serviceHours: [],
            type: ProposalType.EVENT,
        });
    });

    it("nao monta sem data, inicio ou fim, nem com fim antes do inicio", () => {
        expect(buildQuoteInput({ ...filled, date: "" })).toBeNull();
        expect(buildQuoteInput({ ...filled, startHour: "" })).toBeNull();
        expect(buildQuoteInput({ ...filled, endHour: undefined })).toBeNull();
        expect(buildQuoteInput({ ...filled, endHour: "18:00" })).toBeNull();
    });

    it("nao monta com convidados vazios, zero ou fracionados", () => {
        expect(buildQuoteInput({ ...filled, guestNumber: "" })).toBeNull();
        expect(buildQuoteInput({ ...filled, guestNumber: "0" })).toBeNull();
        expect(buildQuoteInput({ ...filled, guestNumber: "2.5" })).toBeNull();
    });

    it("leva as horas do servico por hora e espera ate elas serem validas", () => {
        const withLed = { ...filled, selectedServiceIds: ["limpeza", "led"] };
        expect(buildQuoteInput(withLed)).toBeNull();
        expect(buildQuoteInput({ ...withLed, serviceHoursInput: { led: "5" } })).toBeNull();
        expect(buildQuoteInput({ ...withLed, serviceHoursInput: { led: "3" } })?.serviceHours).toEqual([
            { serviceId: "led", hours: 3 },
        ]);
    });

    it("leva a cortesia preenchida e espera ela ser valida", () => {
        const withLed = { ...filled, selectedServiceIds: ["limpeza", "led"], serviceHoursInput: { led: "3" } };
        expect(buildQuoteInput({ ...withLed, serviceCourtesyInput: { led: "2", limpeza: "1" } })?.serviceCourtesy).toEqual([
            { serviceId: "limpeza", quantity: 1 },
            { serviceId: "led", quantity: 2 },
        ]);
        expect(buildQuoteInput({ ...withLed, serviceCourtesyInput: { led: "4" } })).toBeNull();
        expect(buildQuoteInput({ ...withLed, serviceCourtesyInput: { led: "0" } })).not.toHaveProperty("serviceCourtesy");
    });
});
