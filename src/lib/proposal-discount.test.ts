import { describe, expect, it } from "vitest";
import {
    applyDiscount,
    DISCOUNT_MESSAGE,
    discountBreakdown,
    discountLabel,
    discountRemovedNotice,
    parseDiscountInput,
} from "./proposal-discount";

describe("parseDiscountInput", () => {
    it("vazio vale 0 sem erro", () => {
        expect(parseDiscountInput("")).toEqual({ percent: 0, error: null });
        expect(parseDiscountInput("  ")).toEqual({ percent: 0, error: null });
    });

    it("aceita inteiro, virgula e ponto com ate duas casas", () => {
        expect(parseDiscountInput("10")).toEqual({ percent: 10, error: null });
        expect(parseDiscountInput("7,5")).toEqual({ percent: 7.5, error: null });
        expect(parseDiscountInput("7.25")).toEqual({ percent: 7.25, error: null });
        expect(parseDiscountInput("100")).toEqual({ percent: 100, error: null });
        expect(parseDiscountInput("7,")).toEqual({ percent: 7, error: null });
    });

    it.each(["101", "-1", "100,01", "10,123", "abc", "1e2"])("recusa %s com a mensagem do backend", (raw) => {
        expect(parseDiscountInput(raw)).toEqual({ percent: 0, error: DISCOUNT_MESSAGE });
    });
});

describe("applyDiscount", () => {
    it("mesma conta do backend", () => {
        expect(applyDiscount(5800, 10)).toEqual({ discountPercent: 10, discountAmount: 580, totalAmount: 5220 });
        expect(applyDiscount(999.99, 7.5)).toEqual({ discountPercent: 7.5, discountAmount: 75, totalAmount: 924.99 });
        expect(applyDiscount(5800, 100)).toEqual({ discountPercent: 100, discountAmount: 5800, totalAmount: 0 });
        expect(applyDiscount(5800, 0)).toEqual({ discountPercent: 0, discountAmount: 0, totalAmount: 5800 });
    });
});

describe("discountBreakdown", () => {
    it("10% gravado mostra subtotal 5800 e desconto 580", () => {
        expect(discountBreakdown({ totalAmount: 5220, discountPercent: 10, discountAmount: 580 }))
            .toEqual({ subtotal: 5800, label: "Desconto (10%)", amount: 580 });
    });

    it("100% reconstroi o subtotal pelo desconto", () => {
        expect(discountBreakdown({ totalAmount: 0, discountPercent: 100, discountAmount: 5800 }))
            .toEqual({ subtotal: 5800, label: "Desconto (100%)", amount: 5800 });
    });

    it("sem desconto ou orcamento antigo fica como hoje", () => {
        expect(discountBreakdown({ totalAmount: 5800, discountPercent: 0, discountAmount: 0 })).toBeNull();
        expect(discountBreakdown({ totalAmount: 5800 })).toBeNull();
    });
});

describe("textos do desconto", () => {
    it("rotulo com virgula decimal", () => {
        expect(discountLabel(10)).toBe("Desconto (10%)");
        expect(discountLabel(7.5)).toBe("Desconto (7,5%)");
    });

    it("aviso so quando ha desconto", () => {
        expect(discountRemovedNotice(10)).toBe("O desconto de 10% deixa de valer se você alterar o orçamento.");
        expect(discountRemovedNotice(0)).toBeNull();
        expect(discountRemovedNotice(undefined)).toBeNull();
    });
});
