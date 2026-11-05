import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Goal } from "@/types/goal";
import { VenueDashboardData } from "@/types/venue";
import { VenuePerformanceChart } from "./VenuePerformanceChart";
import { VenuePerformanceChartAllMonths } from "./VenuePerformanceChartAllMonths";
import { performanceLabel } from "./VenuePerformanceSeries";

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
  it("no mes mostra a receita e a meta do periodo", () => {
    const html = renderToStaticMarkup(
      <VenuePerformanceChart data={data} goals={goals} selectedMonth={11} />,
    );

    expect(html).toContain("nov. receita R$\u00a09.089,00 meta R$\u00a010.000,00");
    expect(html).toContain("Receita");
    expect(html).toContain("Meta");
    expect(html).not.toContain("janeiro");
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

  it("omite o rotulo quando a receita e zero", () => {
    expect(performanceLabel(0)).toBe("");
    expect(performanceLabel(9089)).not.toContain("R$");
    expect(performanceLabel(9089).length).toBeLessThan("R$ 9.089,00".length);
  });
});
