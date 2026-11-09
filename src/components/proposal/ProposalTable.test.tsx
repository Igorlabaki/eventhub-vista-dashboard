import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Proposal } from "@/types/proposal";
import { ProposalTable } from "./ProposalTable";

const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const proposal = {
  id: "p1",
  completeClientName: "Duska Pereira",
  startDate: "2026-11-28T18:00:00.000Z",
  totalAmount: 4276,
  status: "FECHADO",
} as unknown as Proposal;

function markup(props: Partial<Parameters<typeof ProposalTable>[0]> = {}) {
  return renderToStaticMarkup(
    <ProposalTable
      proposals={[proposal]}
      isLoading={false}
      monthNames={monthNames}
      selectedMonth={10}
      selectedYear={2026}
      sortBy="startDate"
      sortDir="asc"
      onSort={() => {}}
      {...props}
    />,
  );
}

describe("tabela da listagem", () => {
  it("orcamentos mostra valor e status", () => {
    const html = markup();
    expect(html).toContain("Valor Total");
    expect(html).toContain("4.276,00");
    expect(html).toContain("Status");
    expect(html).toContain("Fechado");
  });

  it("eventos mostra valor sem status", () => {
    const html = markup({ kind: "events" });
    expect(html).toContain("Duska Pereira");
    expect(html).toContain("Valor Total");
    expect(html).toContain("4.276,00");
    expect(html).not.toContain("Status");
    expect(html).not.toContain("Fechado");
  });

  it("sem VIEW_AMOUNTS esconde a coluna de valor", () => {
    const html = markup({ kind: "events", showAmount: false });
    expect(html).not.toContain("Valor Total");
    expect(html).not.toContain("4.276,00");
  });

  it("lista vazia fala de evento e ocupa as colunas visiveis", () => {
    const events = markup({ kind: "events", proposals: [] });
    expect(events).toContain("Nenhum evento encontrado para Nov/2026.");
    expect(events).toContain('colSpan="3"');

    const hidden = markup({ kind: "events", proposals: [], showAmount: false });
    expect(hidden).toContain('colSpan="2"');

    const budgets = markup({ proposals: [] });
    expect(budgets).toContain("Nenhum orçamento encontrado para Nov/2026.");
    expect(budgets).toContain('colSpan="4"');
  });
});
