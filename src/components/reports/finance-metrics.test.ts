import { describe, expect, it } from "vitest";
import { buildFinanceModel, FinanceInput } from "./finance-metrics";

function money(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function input(overrides: Partial<FinanceInput> = {}): FinanceInput {
  return {
    year: "2026",
    previousYear: "2025",
    revenue: 200,
    revenueMonths: [20, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30],
    recurringMonthly: 10,
    recurringAnnual: 40,
    sporadicTotal: 10,
    composition: [
      { name: "IPTU", value: 30 },
      { name: "Faxina", value: 10 },
      { name: "Manutenção", value: 10 },
    ],
    previous: { revenue: 100, expenses: 40 },
    ...overrides,
  };
}

describe("financeiro no formato de orcamentos", () => {
  it("monta receita, despesa, liquido e margem com a variacao do ano anterior", () => {
    const model = buildFinanceModel(input());

    expect(model.kpis.map((kpi) => kpi.label)).toEqual([
      "Receita bruta",
      "Despesas totais",
      "Receita líquida",
      "Margem líquida",
    ]);
    expect(model.kpis.map((kpi) => kpi.value)).toEqual([
      money(200),
      money(50),
      money(150),
      "75,0%",
    ]);
    expect(model.kpis[0].delta.text).toBe("+100% em relação a 2025");
    expect(model.kpis[1].delta.text).toBe("+25% vs. 2025");
    expect(model.kpis[2].delta.text).toBe("+150% vs. 2025");
    expect(model.kpis[3].delta.text).toBe("+15,0 p.p. vs. 2025");
    expect(model.largest).toBe("IPTU (60%)");
    expect(model.composition.map((item) => item.percent)).toEqual([60, 20, 20]);
    expect(model.monthlyExpense).toBe(money(10));
    expect(model.sporadicExpense).toBe(money(10));
  });

  it("repete a despesa recorrente em cada mes e deixa a esporadica fora da serie", () => {
    const model = buildFinanceModel(input());

    expect(model.expenseMonths).toEqual(Array(12).fill(10));
    expect(model.kpis[1].spark).toEqual(Array(12).fill(10));
    expect(model.revenueMonths[0]).toBe(20);
    expect(model.marginMonths[0]).toBe(50);
    expect(model.marginMonths[2]).toBe(0);
  });

  it("nao inventa variacao nem divide a margem quando falta base", () => {
    const withoutPrevious = buildFinanceModel(input({ previous: null }));
    const withoutRevenue = buildFinanceModel(input({ revenue: 0, previous: { revenue: 0, expenses: 0 } }));

    expect(withoutPrevious.kpis.every((kpi) => kpi.delta.text === null)).toBe(true);
    expect(withoutPrevious.kpis[0].delta.aria).toBe("sem comparação com o ano anterior");
    expect(withoutRevenue.kpis[3].value).toBe("—");
    expect(withoutRevenue.kpis[3].delta.text).toBeNull();
    expect(withoutRevenue.compositionEmpty).toBe(false);
  });

  it("mostra a composicao vazia quando nao ha despesa nomeada", () => {
    const model = buildFinanceModel(input({
      recurringAnnual: 0,
      recurringMonthly: 0,
      sporadicTotal: 0,
      composition: [],
      previous: null,
    }));

    expect(model.compositionEmpty).toBe(true);
    expect(model.largest).toBeNull();
    expect(model.kpis[1].value).toBe(money(0));
    expect(model.sporadicExpense).toBe(money(0));
  });
});
