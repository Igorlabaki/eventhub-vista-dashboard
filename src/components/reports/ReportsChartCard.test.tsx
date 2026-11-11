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
    expect(html).not.toContain("Média dos anos");
  });

  it("lista o ano anterior e a media dos anos na legenda e na leitura de tela", () => {
    const html = renderToStaticMarkup(
      <ReportsChartCard
        kind="orcamentos"
        input={{
          ...input,
          previousMonths: { count: [250], approved: [], proposals: [250] },
          averageMonths: { count: [187.25], rate: [] },
        }}
      />,
    );

    expect(html).toContain("Média dos anos");
    expect(html).toContain("jan. 291, 2025 250, média dos anos 187,3");
    expect(html).toContain("fev. 187, 2025 0, média dos anos 0");
  });

  it("mostra a rosca das categorias com total, legenda e sem categoria", () => {
    const html = renderToStaticMarkup(
      <ReportsChartCard
        kind="orcamentos"
        input={{
          ...input,
          categories: [
            { key: "BIRTHDAY", count: 31 },
            { key: "CORPORATE", count: 9 },
            { key: null, count: 60 },
          ],
        }}
      />,
    );

    expect(html).toContain("Categorias dos eventos");
    expect(html).toContain("Orçamentos de 2026 por categoria do evento");
    expect(html).toContain("Distribuição de 100 orçamentos por categoria");
    expect(html).toContain("Sem categoria");
    expect(html).toContain("Aniversário");
    expect(html).toContain("Empresarial / confraternização");
    expect(html).toContain(" · 31%");
    expect(html).not.toContain("Casamento");
  });

  it("mostra estado vazio da rosca sem propostas no ano", () => {
    const html = renderToStaticMarkup(<ReportsChartCard kind="eventos" input={{ ...input, categories: [] }} />);

    expect(html).toContain("Categorias dos eventos");
    expect(html).toContain("Nenhum registro neste ano.");
  });
});
