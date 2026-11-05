import { describe, expect, it } from "vitest";
import {
  annualGoalTotal,
  isCountConfigured,
  isMinimumConfigured,
  panelBlockState,
  resolveCurrentPrice,
  samplePanelItems,
} from "./goals-panel-metrics";

const year = "1,2,3,4,5,6,7,8,9,10,11,12";

describe("resumo do painel de metas", () => {
  it("soma a meta anual pelos meses validos", () => {
    expect(annualGoalTotal([{ minValue: 10000, months: year }])).toBe(120000);
    expect(
      annualGoalTotal([
        { minValue: 10000, months: year },
        { minValue: 5000, months: "1,2" },
      ]),
    ).toBe(130000);
  });

  it("ignora mes invalido e trata meta sem mes como zero", () => {
    expect(annualGoalTotal([{ minValue: 10000, months: "0,13" }])).toBe(0);
    expect(annualGoalTotal([{ minValue: 10000, months: "" }])).toBe(0);
  });

  it("nao tem total quando nao ha meta", () => {
    expect(annualGoalTotal([])).toBeNull();
  });

  it("so considera preco com modelo conhecido e valor maior que zero", () => {
    expect(resolveCurrentPrice(null)).toBeNull();
    expect(resolveCurrentPrice({ pricingModel: "PER_PERSON", pricePerPerson: 0 })).toBeNull();
    expect(resolveCurrentPrice({ pricingModel: "OUTRO", pricePerPerson: 100 })).toBeNull();
    expect(resolveCurrentPrice({ pricingModel: "PER_PERSON", pricePerPerson: 100 })).toEqual({
      label: "Preço por Pessoa",
      price: 100,
    });
  });

  it("trata minimo ausente ou zero como nao configurado", () => {
    expect(isMinimumConfigured(null)).toBe(false);
    expect(isMinimumConfigured(undefined)).toBe(false);
    expect(isMinimumConfigured(0)).toBe(false);
    expect(isMinimumConfigured(2500)).toBe(true);
  });

  it("trata contagem zero como nao configurada", () => {
    expect(isCountConfigured(0)).toBe(false);
    expect(isCountConfigured(3)).toBe(true);
  });

  it("limita a amostra a tres itens", () => {
    expect(samplePanelItems([1, 2, 3, 4])).toEqual([1, 2, 3]);
  });

  it("prioriza carregamento e erro sobre o vazio", () => {
    expect(panelBlockState({ isLoading: true, error: "falha", hasData: false })).toBe("loading");
    expect(panelBlockState({ isLoading: false, error: "falha", hasData: false })).toBe("error");
    expect(panelBlockState({ isLoading: false, error: null, hasData: false })).toBe("empty");
    expect(panelBlockState({ isLoading: false, error: null, hasData: true })).toBe("ready");
  });
});
