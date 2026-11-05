import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FinancialReportCard } from "./FinancialReportCard";
import { FinanceInput } from "./finance-metrics";

const input: FinanceInput = {
  year: "2026",
  previousYear: "2025",
  revenue: 202028.52,
  revenueMonths: [12000, 10000, 9000, 14000, 11000, 15000, 12000, 16000, 18000, 20000, 25000, 40028.52],
  recurringMonthly: 3367.92,
  recurringAnnual: 40415.04,
  sporadicTotal: 0,
  composition: [
    { name: "IPTU", value: 18455.04 },
    { name: "Faxina", value: 6000 },
    { name: "Água", value: 6000 },
    { name: "Luz", value: 6000 },
    { name: "Piscineiro", value: 3960 },
  ],
  previous: null,
};

describe("tela financeira no formato de orcamentos", () => {
  it("mostra os quatro numeros, o grafico, a composicao e os destaques", () => {
    const html = renderToStaticMarkup(<FinancialReportCard input={input} />);

    expect(html).toContain("Receita bruta");
    expect(html).toContain("Despesas totais");
    expect(html).toContain("Receita líquida");
    expect(html).toContain("Margem líquida");
    expect(html).toContain("sem comparação com o ano anterior");
    expect(html).toContain("Receita x despesa");
    expect(html).toContain("Receita e despesa recorrente em 2026");
    expect(html).toContain("Valores");
    expect(html).toContain("Margem");
    expect(html).toContain("Composição das despesas");
    expect(html).toContain("IPTU");
    expect(html).toContain("46%");
    expect(html).toContain("Principais insights");
    expect(html).toContain("Destaques de 2026");
    expect(html).toContain("Maior despesa");
    expect(html).toContain("Despesa mensal");
    expect(html).toContain("Esporádicas");
    expect(html).not.toContain("Adicionar despesa");
  });

  it("mostra o vazio quando nao ha despesa", () => {
    const html = renderToStaticMarkup(
      <FinancialReportCard
        input={{ ...input, recurringAnnual: 0, recurringMonthly: 0, composition: [], revenue: 0 }}
      />,
    );

    expect(html).toContain("Nenhuma despesa cadastrada");
    expect(html).toContain(">—</p>");
  });
});
