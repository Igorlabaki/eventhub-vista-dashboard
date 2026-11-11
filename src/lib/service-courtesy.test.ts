import { describe, expect, it } from "vitest";
import {
    COURTESY_MESSAGE,
    chosenServiceCourtesy,
    courtesyAmount,
    courtesyDetail,
    courtesyFieldError,
    courtesyInputFromLines,
    courtesyLabel,
    fullServiceAmount,
} from "./service-courtesy";

const services = [
    { id: "dj", pricingType: "PER_HOUR" },
    { id: "buffet", pricingType: "PER_PERSON" },
    { id: "decoracao", pricingType: "FIXED" },
];

function brl(value: number) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

describe("campo de cortesia", () => {
    it("aceita vazio e inteiros ate o limite", () => {
        expect(courtesyFieldError("", 6)).toBeNull();
        expect(courtesyFieldError("0", 6)).toBeNull();
        expect(courtesyFieldError("6", 6)).toBeNull();
    });

    it("recusa acima do limite, negativo ou fracionado", () => {
        expect(courtesyFieldError("7", 6)).toBe(COURTESY_MESSAGE);
        expect(courtesyFieldError("-1", 6)).toBe(COURTESY_MESSAGE);
        expect(courtesyFieldError("1.5", 6)).toBe(COURTESY_MESSAGE);
        expect(courtesyFieldError("100001", null)).toBe(COURTESY_MESSAGE);
    });
});

describe("cortesia dos servicos escolhidos", () => {
    const base = {
        services,
        selectedIds: ["dj", "buffet", "decoracao"],
        hoursInput: { dj: "6" },
        guestNumber: 100,
    };

    it("monta so as cortesias maiores que zero dos servicos marcados", () => {
        const result = chosenServiceCourtesy({
            ...base,
            selectedIds: ["dj", "decoracao"],
            courtesyInput: { dj: "2", buffet: "10", decoracao: "" },
        });
        expect(result).toEqual({ serviceCourtesy: [{ serviceId: "dj", quantity: 2 }], errors: {} });
    });

    it("limita por horas, convidados e 1 no fixo", () => {
        const result = chosenServiceCourtesy({
            ...base,
            courtesyInput: { dj: "7", buffet: "101", decoracao: "2" },
        });
        expect(result.serviceCourtesy).toEqual([]);
        expect(result.errors).toEqual({ dj: COURTESY_MESSAGE, buffet: COURTESY_MESSAGE, decoracao: COURTESY_MESSAGE });
    });

    it("aceita o maximo de cada tipo", () => {
        const result = chosenServiceCourtesy({
            ...base,
            courtesyInput: { dj: "6", buffet: "100", decoracao: "1" },
        });
        expect(result.serviceCourtesy).toEqual([
            { serviceId: "dj", quantity: 6 },
            { serviceId: "buffet", quantity: 100 },
            { serviceId: "decoracao", quantity: 1 },
        ]);
    });

    it("abre a edicao com a cortesia gravada", () => {
        expect(courtesyInputFromLines([
            { serviceId: "dj", courtesyQuantity: 2 },
            { serviceId: "buffet", courtesyQuantity: 0 },
            { serviceId: "decoracao", courtesyQuantity: 1 },
            { serviceId: "som" },
        ])).toEqual({ dj: "2", decoracao: "1" });
    });
});

describe("exibicao da cortesia", () => {
    it("mostra horas de cortesia, desconto e valor cheio na linha por hora", () => {
        const line = { pricingType: "PER_HOUR", unitPrice: 50, courtesyQuantity: 2, amount: 200 };
        expect(courtesyAmount(line)).toBe(100);
        expect(fullServiceAmount(line)).toBe(300);
        expect(courtesyDetail(line)).toBe(`Cortesia: 2h (-${brl(100)})`);
    });

    it("mostra o fixo de cortesia com valor final zero", () => {
        const line = { pricingType: "FIXED", unitPrice: 1500, courtesyQuantity: 1, amount: 0 };
        expect(courtesyDetail(line)).toBe(`Cortesia (-${brl(1500)})`);
        expect(fullServiceAmount(line)).toBe(1500);
    });

    it("mostra pessoas de cortesia", () => {
        expect(courtesyLabel({ pricingType: "PER_PERSON", courtesyQuantity: 1 }, 80)).toBe(`Cortesia: 1 pessoa (-${brl(80)})`);
        expect(courtesyLabel({ pricingType: "PER_PERSON", courtesyQuantity: 10 }, 800)).toBe(`Cortesia: 10 pessoas (-${brl(800)})`);
    });

    it("linha sem cortesia fica como hoje", () => {
        const line = { pricingType: "PER_HOUR", unitPrice: 50, courtesyQuantity: 0, amount: 300 };
        expect(courtesyDetail(line)).toBeNull();
        expect(fullServiceAmount(line)).toBe(300);
        expect(courtesyDetail({ pricingType: "FIXED", unitPrice: 100 })).toBeNull();
    });
});
