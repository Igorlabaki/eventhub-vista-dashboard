import { describe, expect, it } from "vitest";
import { perPersonAmount, perPersonLabel } from "./per-person-amount";

describe("valor por pessoa ao lado do Total", () => {
    it("divide o total pelos convidados", () => {
        expect(perPersonAmount("5000", "100")).toBe(50);
        expect(perPersonAmount("5000.00", "80")).toBe(62.5);
        expect(perPersonAmount("1234.56", "10")).toBe(123.46);
    });

    it("arredonda em duas casas quando a divisao nao e exata", () => {
        expect(perPersonAmount("5000", "3")).toBe(1666.67);
        expect(perPersonLabel("5000", "3")).toContain("1.666,67");
    });

    it("nao calcula sem total ou sem convidados validos", () => {
        expect(perPersonAmount("", "100")).toBeNull();
        expect(perPersonAmount(undefined, "100")).toBeNull();
        expect(perPersonAmount("0", "100")).toBeNull();
        expect(perPersonAmount("5000", "")).toBeNull();
        expect(perPersonAmount("5000", "0")).toBeNull();
        expect(perPersonAmount("5000", "-2")).toBeNull();
        expect(perPersonAmount("5000", "1.5")).toBeNull();
        expect(perPersonAmount("abc", "100")).toBeNull();
    });

    it("mostra o valor em reais por pessoa ou o traco", () => {
        expect(perPersonLabel("5000", "100")).toContain("50,00");
        expect(perPersonLabel("5000", "100")).toMatch(/ \/ pessoa$/);
        expect(perPersonLabel("", "100")).toBe("— / pessoa");
        expect(perPersonLabel("5000", "0")).toBe("— / pessoa");
    });
});
