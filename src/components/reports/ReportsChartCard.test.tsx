import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ReportsChartCard } from "./ReportsChartCard";
import { ReportInput } from "./report-metrics";

const input: ReportInput = {
  kind: "orcamentos",
  year: "2026",
  previousYear: "2025",
  current: { count: 2405, amount: 2405 * 7971.25, guests: 2405 * 55, approved: 41, proposals: 2405 },
  previous: null,
  countMonths: [291, 187, 211, 189, 169, 158, 108, 156, 150, 201, 245, 340],
  amountMonths: [],
  guestMonths: [],
  approvedMonths: [],
  proposalMonths: [291, 187, 211, 189, 169, 158, 108, 156, 150, 201, 245, 340],
  traffic: [
    { name: "other", count: 975 },
    { name: "instagram", count: 531 },
    { name: "tikTok", count: 397 },
    { name: "google", count: 386 },
    { name: "friend", count: 72 },
    { name: "airbnb", count: 34 },
    { name: "facebook", count: 10 },
  ],
};

describe("tela do relatorio anual", () => {
  it("mostra cards, grafico, origem e insights sem variacao inventada", () => {
    const html = renderToStaticMarkup(<ReportsChartCard kind="orcamentos" input={input} />);

    expect(html).toContain("Total de orçamentos");
    expect(html).toContain(">2405</p>");
    expect(html).toContain("Taxa de conversão");
    expect(html).toContain("Ticket médio");
    expect(html).toContain("Pessoas em média");
    expect(html).toContain("sem comparação com o ano anterior");
    expect(html).toContain("Orçamentos por mês");
    expect(html).toContain("Evolução mensal de orçamentos em 2026");
    expect(html).toContain("Origem dos leads");
    expect(html).toContain("Principais insights");
    expect(html).toContain("Destaques de 2026");
    expect(html).toContain("Dezembro");
    expect(html).toContain("Participação de dezembro");
    expect(html).toContain("Outros (41%)");
    expect(html).toContain("Instagram");
    expect(html).toContain("Tendência");
  });
});
