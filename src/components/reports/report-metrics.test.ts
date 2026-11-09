import { describe, expect, it } from "vitest";
import { averageMonths, buildReportModel, YearTotals } from "./report-metrics";

const months = [291, 187, 211, 189, 169, 158, 108, 156, 150, 201, 245, 340];

const current: YearTotals = {
  count: 2405,
  amount: 2405 * 7971.25,
  guests: 2405 * 55,
  approved: 41,
  proposals: 2405,
};

const previous: YearTotals = {
  count: 1730,
  amount: 1730 * 7117.1875,
  guests: 1730 * 52.38,
  approved: 24,
  proposals: 1730,
};

function model(overrides: Partial<Parameters<typeof buildReportModel>[0]> = {}) {
  return buildReportModel({
    kind: "orcamentos",
    year: "2026",
    previousYear: "2025",
    current,
    previous,
    countMonths: months,
    amountMonths: months.map((count) => count * 7971.25),
    guestMonths: months.map((count) => count * 55),
    approvedMonths: months.map(() => 0),
    proposalMonths: months,
    traffic: [
      { name: "other", count: 975 },
      { name: "instagram", count: 531 },
      { name: "tikTok", count: 397 },
      { name: "google", count: 386 },
      { name: "friend", count: 72 },
      { name: "airbnb", count: 34 },
      { name: "facebook", count: 10 },
    ],
    ...overrides,
  });
}

describe("relatorio anual no formato da referencia", () => {
  it("monta os indicadores, o melhor mes e os canais com os numeros do ano", () => {
    const report = model();

    expect(report.kpis.map((kpi) => kpi.value)).toEqual(["2405", "1,7%", expect.stringContaining("7.971,25"), "55"]);
    expect(report.kpis[0].delta.text).toBe("+39% em relação a 2025");
    expect(report.kpis[1].delta.text).toBe("+0,3 p.p. vs. 2025");
    expect(report.kpis[2].delta.text).toBe("+12% vs. 2025");
    expect(report.kpis[3].delta.text).toBe("+5% vs. 2025");
    expect(report.bestMonth).toBe("Dezembro");
    expect(report.participationLabel).toBe("Participação de dezembro");
    expect(report.participation).toBe("14%");
    expect(report.topChannel).toBe("Outros (41%)");
    expect(report.socialLeader).toBe("Instagram");
    expect(report.traffic[0]).toMatchObject({ name: "Outros", value: 975, percent: 41 });
    expect(report.chartTitle).toBe("Orçamentos por mês");
  });

  it("nao inventa variacao quando o ano anterior nao tem base", () => {
    const report = model({
      previous: { count: 0, amount: 0, guests: 0, approved: 0, proposals: 0 },
    });

    expect(report.kpis.every((kpi) => kpi.delta.text === null)).toBe(true);
    expect(report.kpis[0].delta.aria).toBe("sem comparação com o ano anterior");
    expect(report.kpis[0].value).toBe("2405");
  });

  it("nao destaca mes nem canal quando a serie esta zerada", () => {
    const report = model({
      current: { count: 0, amount: 0, guests: 0, approved: 0, proposals: 0 },
      previous: null,
      countMonths: [],
      amountMonths: [],
      guestMonths: [],
      approvedMonths: [],
      proposalMonths: [],
      traffic: [],
    });

    expect(report.bestMonth).toBeNull();
    expect(report.participation).toBeNull();
    expect(report.participationLabel).toBe("Participação do mês");
    expect(report.topChannel).toBeNull();
    expect(report.socialLeader).toBeNull();
    expect(report.kpis[3].value).toBe("0");
  });

  it("escolhe o mes mais tarde no empate e o social com mais entradas", () => {
    const report = model({
      countMonths: [0, 0, 10, 0, 0, 10, 0, 0, 0, 0, 0, 0],
      traffic: [
        { name: "instagram", count: 2 },
        { name: "facebook", count: 9 },
        { name: "other", count: 40 },
      ],
    });

    expect(report.bestMonth).toBe("Junho");
    expect(report.socialLeader).toBe("Facebook");
    expect(report.topChannel).toBe("Outros (78%)");
  });

  it("monta a serie do ano anterior para quantidade e conversao", () => {
    const report = model({
      previousMonths: {
        count: [10, 20],
        approved: [1, 0],
        proposals: [10, 0],
      },
    });

    expect(report.previousLabel).toBe("2025");
    expect(report.previousQuantitySeries).toEqual([10, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(report.previousConversionSeries?.slice(0, 3)).toEqual([10, 0, 0]);
  });

  it("nao desenha ano anterior nem media sem dado", () => {
    const report = model();

    expect(report.previousQuantitySeries).toBeNull();
    expect(report.previousConversionSeries).toBeNull();
    expect(report.averageQuantitySeries).toBeNull();
    expect(report.averageConversionSeries).toBeNull();
  });

  it("usa a media de quantidade e a taxa agregada que vem da rota", () => {
    const report = model({ averageMonths: { count: [187.5, 0], rate: [12.5, 0] } });

    expect(report.averageQuantitySeries?.slice(0, 3)).toEqual([187.5, 0, 0]);
    expect(report.averageConversionSeries?.slice(0, 3)).toEqual([12.5, 0, 0]);
  });

  it("le a media de orcamentos ou de aprovados pelos nomes dos meses", () => {
    const points = [
      { month: "fev.", proposals: 4, approved: 1, rate: 25 },
      { month: "jan.", proposals: 2, approved: 2, rate: 100 },
    ];

    expect(averageMonths(points, "proposals")?.count.slice(0, 3)).toEqual([2, 4, 0]);
    expect(averageMonths(points, "approved")?.count.slice(0, 3)).toEqual([2, 1, 0]);
    expect(averageMonths(points, "approved")?.rate.slice(0, 3)).toEqual([100, 25, 0]);
    expect(averageMonths([], "proposals")).toBeNull();
    expect(averageMonths(undefined, "proposals")).toBeNull();
  });

  it("troca os rotulos na aba de eventos", () => {
    const report = model({ kind: "eventos" });

    expect(report.kpis[0].label).toBe("Total de eventos");
    expect(report.chartTitle).toBe("Eventos por mês");
    expect(report.chartSubtitle).toBe("Evolução mensal de eventos em 2026");
    expect(report.quantityToggle).toBe("Eventos");
    expect(report.leadsSubtitle).toBe("Canais de entrada dos eventos");
  });
});
