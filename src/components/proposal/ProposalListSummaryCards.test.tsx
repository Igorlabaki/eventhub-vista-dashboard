import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProposalListSummary } from "@/types/proposal";
import { ProposalListSummaryCards } from "./ProposalListSummaryCards";

function summary(change: ProposalListSummary["change"]): ProposalListSummary {
  return {
    total: 243,
    monthAmount: 12590,
    amountMax: 12590,
    conversionRate: 1,
    daily: [{ day: 1, count: 1, amount: 10, conversionRate: 0 }],
    change,
  };
}

function markup(value: ProposalListSummary | null) {
  return renderToStaticMarkup(<ProposalListSummaryCards summary={value} />);
}

describe("cards de resumo da listagem", () => {
  it("mostra alta, queda, zero e traco sem recalcular o numero principal", () => {
    const html = markup(summary({ total: 22, monthAmount: -10, conversionRate: 0 }));

    expect(html).toContain("Total de orçamentos");
    expect(html).toContain(">243</p>");
    expect(html).toContain("12.590,00");
    expect(html).toContain(">1%</p>");
    expect(html).toContain(">+22%</span>");
    expect(html).toContain("text-emerald-600");
    expect(html).toContain("lucide-trending-up");
    expect(html).toContain("22% acima do mesmo período do ano anterior");
    expect(html).toContain(">-10%</span>");
    expect(html).toContain("text-red-600");
    expect(html).toContain("lucide-trending-down");
    expect(html).toContain("10% abaixo do mesmo período do ano anterior");
    expect(html).toContain(">0%</span>");
    expect(html).toContain("lucide-minus");
    expect(html).toContain("igual ao mesmo período do ano anterior");
    expect(html).toContain("h-12 w-28");

    const missing = markup(summary({ total: null, monthAmount: null, conversionRate: null }));
    expect(missing).toContain("sem comparação com o ano anterior");
    expect(missing).toContain(">—</p>");
    expect(missing).not.toContain("lucide-trending-up");
    expect(missing).not.toContain("lucide-trending-down");
    expect(missing).toContain(">243<");
  });

  it("deixa o canto vazio enquanto o resumo nao chegou", () => {
    const html = markup(null);
    expect(html).toContain(">0</p>");
    expect(html).not.toContain("ano anterior");
    expect(html).not.toContain(">—</p>");
    expect(html).not.toContain("lucide-trending-up");
    expect(html).toContain("h-12 w-28");
  });

  it("deixa o canto vazio quando change nao veio", () => {
    const html = markup({ ...summary(undefined), change: undefined });
    expect(html).toContain(">243</p>");
    expect(html).not.toContain("ano anterior");
    expect(html).not.toContain(">—</p>");
  });

  it("orcamentos continua com os tres cards", () => {
    const html = markup(summary({ total: 22, monthAmount: -10, conversionRate: 0 }));
    expect(html).toContain("md:grid-cols-3");
    expect(html).toContain("Conversão");
    expect(html).not.toContain("Total de eventos");
  });

  it("eventos mostra total e valor, sem conversao", () => {
    const html = renderToStaticMarkup(
      <ProposalListSummaryCards summary={summary({ total: 22, monthAmount: -10, conversionRate: 0 })} kind="events" />,
    );
    expect(html).toContain("Total de eventos");
    expect(html).not.toContain("Total de orçamentos");
    expect(html).toContain("Valor no mês");
    expect(html).toContain("12.590,00");
    expect(html).not.toContain("Conversão");
    expect(html).toContain("md:grid-cols-2");
    expect(html).toContain(">+22%</span>");
  });

  it("eventos sem VIEW_AMOUNTS fica so com o total", () => {
    const html = renderToStaticMarkup(
      <ProposalListSummaryCards summary={summary(undefined)} kind="events" showAmount={false} />,
    );
    expect(html).toContain("Total de eventos");
    expect(html).not.toContain("Valor no mês");
    expect(html).not.toContain("12.590,00");
    expect(html).toContain("md:grid-cols-1");
  });
});