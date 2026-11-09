import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Goal } from "@/types/goal";
import { VenueDashboardData } from "@/types/venue";
import { VenuePerformanceChart } from "./VenuePerformanceChart";
import { VenuePerformanceChartAllMonths } from "./VenuePerformanceChartAllMonths";
import { averageRevenue, performanceLabel, performanceTitle, trendPerformancePoints } from "./VenuePerformanceSeries";

const data = {
  monthlyRevenue: 9089,
  monthlyRevenueList: [
    { month: 3, revenue: 33950.14 },
    { month: 11, revenue: 9089 },
  ],
} as VenueDashboardData;

const goals = [
  {
    id: "1",
    minValue: 10000,
    increasePercent: 0,
    months: "11",
    venueId: "v",
    createdAt: "",
    updatedAt: "",
  },
] as Goal[];

describe("grafico da visao geral no estilo dos relatorios", () => {
  it("no mes compara o mesmo mes em cada ano, com a tendencia", () => {
    const html = renderToStaticMarkup(
      <VenuePerformanceChart
        data={{
          ...data,
          sameMonthRevenueByYear: [
            { year: 2024, revenue: 0 },
            { year: 2025, revenue: 15000 },
            { year: 2026, revenue: 9089 },
          ],
        }}
        goals={goals}
        selectedMonth={11}
      />,
    );

    expect(html).toContain("2024 receita R$\u00a00,00");
    expect(html).toContain("2025 receita R$\u00a015.000,00");
    expect(html).toContain("2026 receita R$\u00a09.089,00");
    expect(html).toContain("Tendência");
    expect(html).toContain("média R$\u00a08.029,67");
    expect(html).not.toContain("Meta");
  });

  it("a media usa todos os anos do eixo, inclusive os zerados no mes", () => {
    const points = trendPerformancePoints({
      ...data,
      sameMonthRevenueByYear: [
        { year: 2025, revenue: 19700 },
        { year: 2026, revenue: 9100 },
        { year: 2027, revenue: 0 },
      ],
    });

    expect(averageRevenue(points!)).toBe(9600);
  });

  it("media de um ano so e o proprio ano; sem anos ou tudo zero da zero", () => {
    expect(averageRevenue([{ name: "2026", Receita: 9089, Meta: 0 }])).toBe(9089);
    expect(averageRevenue([])).toBe(0);
    expect(averageRevenue([{ name: "2025", Receita: 0, Meta: 0 }, { name: "2026", Receita: 0, Meta: 0 }])).toBe(0);
  });

  it("titulo diz o mes por extenso; no anual continua Desempenho Anual", () => {
    const months = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ];
    months.forEach((month, index) => {
      expect(performanceTitle(String(index + 1))).toBe(`${month} ao longo dos anos`);
    });
    expect(performanceTitle("all")).toBe("Desempenho Anual");
  });

  it("sem anos nao desenha media", () => {
    const html = renderToStaticMarkup(
      <VenuePerformanceChart data={{ ...data, sameMonthRevenueByYear: [] }} goals={goals} selectedMonth={11} />,
    );

    expect(html).not.toContain("Média");
  });

  it("sem anos mostra o estado vazio", () => {
    const html = renderToStaticMarkup(
      <VenuePerformanceChart
        data={{ ...data, sameMonthRevenueByYear: [] }}
        goals={goals}
        selectedMonth={11}
      />,
    );

    expect(html).toContain("Sem anos com registro");
  });

  it("sem o campo novo mantem a barra unica do ano filtrado", () => {
    const html = renderToStaticMarkup(
      <VenuePerformanceChart data={data} goals={goals} selectedMonth={11} />,
    );

    expect(html).toContain("nov. receita R$\u00a09.089,00 meta R$\u00a010.000,00");
    expect(html).toContain("Meta");
    expect(html).not.toContain("Média");
  });

  it("no ano mostra os doze meses e deixa a meta zerada quando nao ha cadastro", () => {
    const html = renderToStaticMarkup(
      <VenuePerformanceChartAllMonths data={data} goals={goals} />,
    );

    expect(html).toContain("jan. receita R$\u00a00,00 meta R$\u00a00,00");
    expect(html).toContain("mar. receita R$\u00a033.950,14 meta R$\u00a00,00");
    expect(html).toContain("nov. receita R$\u00a09.089,00 meta R$\u00a010.000,00");
    expect(html).toContain("dez. receita R$\u00a00,00 meta R$\u00a00,00");
  });

  it("no ano mostra a media dos doze meses, inclusive os zerados", () => {
    const allMonths = renderToStaticMarkup(<VenuePerformanceChartAllMonths data={data} goals={goals} />);
    const annual = renderToStaticMarkup(<VenuePerformanceChart data={data} goals={goals} selectedMonth="all" />);

    [allMonths, annual].forEach((html) => {
      expect(html).toContain("Média 3,6\u00a0mil");
      expect(html).toContain("média R$\u00a03.586,60");
      expect(html).toContain("Meta");
    });
  });

  it("omite o rotulo quando a receita e zero", () => {
    expect(performanceLabel(0)).toBe("");
    expect(performanceLabel(9089)).not.toContain("R$");
    expect(performanceLabel(9089).length).toBeLessThan("R$ 9.089,00".length);
  });
});
