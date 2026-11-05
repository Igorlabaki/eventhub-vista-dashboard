import { describe, expect, it } from "vitest";
import { chosenHoursLabel, hourlyChoiceAmount, publicHourlyRate, quotedServiceAmount, quotedServiceDetail, serviceUnitLabel, sortProposalServicesByPricing } from "./service-price-label";

describe("linha do servico na proposta", () => {
    it("mostra o unitario com o tipo", () => {
        expect(serviceUnitLabel(40, "PER_PERSON")).toContain("/pessoa");
        expect(serviceUnitLabel(200, "PER_HOUR")).toContain("/hora");
        expect(serviceUnitLabel(500, "FIXED")).not.toContain("/");
    });

    it("usa o valor gravado e a multiplicacao fora do preco fixo", () => {
        const line = {
            amount: 3200,
            unitPrice: 40,
            quantity: 80,
            pricingType: "PER_PERSON" as const,
            service: { price: 99 },
        };
        expect(quotedServiceAmount(line)).toBe(3200);
        expect(quotedServiceDetail(line)).toContain("40,00");
        expect(quotedServiceDetail(line)).toContain("80 pessoas");
    });

    it("orcamento antigo sem amount mostra o preco do cadastro, sem multiplicacao", () => {
        const line = { amount: null, service: { price: 150 } };
        expect(quotedServiceAmount(line)).toBe(150);
        expect(quotedServiceDetail(line)).toBeNull();
    });

    it("duracao zero aparece como linha zero", () => {
        const line = {
            amount: 0,
            unitPrice: 50,
            quantity: 0,
            pricingType: "PER_HOUR" as const,
            service: { price: 50 },
        };
        expect(quotedServiceAmount(line)).toBe(0);
        expect(quotedServiceDetail(line)).toContain("× 0 h");
    });
});

describe("horas embaixo do servico por hora", () => {
    it("mostra as horas escolhidas no singular e no plural", () => {
        expect(chosenHoursLabel("PER_HOUR", 1)).toBe("1 hora.");
        expect(chosenHoursLabel("PER_HOUR", 4)).toBe("4 horas.");
    });

    it("nao inventa horas para outro tipo nem para quantidade ausente", () => {
        expect(chosenHoursLabel("PER_PERSON", 80)).toBeNull();
        expect(chosenHoursLabel("FIXED", 1)).toBeNull();
        expect(chosenHoursLabel("PER_HOUR", null)).toBeNull();
        expect(chosenHoursLabel("PER_HOUR", 0)).toBeNull();
    });
});

describe("total do servico por hora no modal", () => {
    it("multiplica o preco da hora pelas horas informadas", () => {
        expect(hourlyChoiceAmount(1500, "5", 8)).toBe(7500);
        expect(hourlyChoiceAmount(300, "5", 8)).toBe(1500);
        expect(hourlyChoiceAmount(1500, "1", 8)).toBe(1500);
    });

    it("nao inventa total com hora vazia, invalida ou alem do evento", () => {
        expect(hourlyChoiceAmount(1500, "", 8)).toBeNull();
        expect(hourlyChoiceAmount(1500, "4h", 8)).toBeNull();
        expect(hourlyChoiceAmount(1500, "9", 8)).toBeNull();
        expect(hourlyChoiceAmount(null, "5", 8)).toBeNull();
    });

    it("usa o preco da hora gravado, depois o do cadastro, depois o valor cotado", () => {
        expect(publicHourlyRate({
            hourly: true,
            amount: 1500,
            hours: 5,
            eventHours: 8,
            unitPrice: 1500,
            catalogPrice: 300,
        })).toBe(1500);
        expect(publicHourlyRate({
            hourly: true,
            amount: 1500,
            hours: 5,
            eventHours: 8,
            catalogPrice: 1500,
        })).toBe(1500);
        expect(publicHourlyRate({
            hourly: true,
            amount: 1200,
            hours: null,
            eventHours: 8,
        })).toBe(150);
        expect(publicHourlyRate({ hourly: false, amount: 300, eventHours: 8 })).toBeNull();
    });
});

describe("ordem dos servicos na proposta publica", () => {
    it("coloca custo fixo, depois por hora, depois por pessoa", () => {
        const lines = [
            { id: "pessoa", pricingType: "PER_PERSON" as const },
            { id: "hora", pricingType: "PER_HOUR" as const },
            { id: "fixo", pricingType: "FIXED" as const },
        ];
        expect(sortProposalServicesByPricing(lines).map((line) => line.id)).toEqual(["fixo", "hora", "pessoa"]);
    });

    it("mantem a ordem relativa dentro do mesmo tipo", () => {
        const lines = [
            { id: "limpeza", pricingType: "FIXED" as const },
            { id: "led", pricingType: "PER_HOUR" as const },
            { id: "recepcionista", pricingType: "FIXED" as const },
            { id: "seguranca", pricingType: "PER_PERSON" as const },
            { id: "som", pricingType: "PER_HOUR" as const },
        ];
        expect(sortProposalServicesByPricing(lines).map((line) => line.id)).toEqual([
            "limpeza",
            "recepcionista",
            "led",
            "som",
            "seguranca",
        ]);
    });

    it("trata linha sem tipo como custo fixo e usa o tipo do cadastro quando a linha nao tem", () => {
        const lines = [
            { id: "hora", pricingType: null, service: { pricingType: "PER_HOUR" as const } },
            { id: "sem-tipo", pricingType: null, service: { pricingType: null } },
            { id: "pessoa", service: { pricingType: "PER_PERSON" as const } },
        ];
        expect(sortProposalServicesByPricing(lines).map((line) => line.id)).toEqual(["sem-tipo", "hora", "pessoa"]);
    });
});
