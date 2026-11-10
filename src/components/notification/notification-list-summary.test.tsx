import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NotificationListSummaryCards } from "./notification-list-summary";
import { NotificationListSummary } from "@/types/notification";

const titles = ["Não lidas", "Últimos 7 dias", "Últimos 30 dias", "Orçamentos novos"];

function cardSlices(html: string) {
  const starts = titles.map((title) => html.indexOf(`>${title}<`));
  return Object.fromEntries(
    titles.map((title, index) => [title, html.slice(starts[index], starts[index + 1] ?? html.length)]),
  );
}

const summary: NotificationListSummary = {
  unread: 16,
  last7Days: 111,
  last30Days: 306,
  newProposals: 282,
  change: { last7Days: 12, last30Days: -8, newProposals: 0 },
};

describe("variacao nos cards de notificacoes", () => {
  it("mostra alta, queda e igual contra o periodo anterior", () => {
    const cards = cardSlices(renderToStaticMarkup(<NotificationListSummaryCards summary={summary} />));
    expect(cards["Últimos 7 dias"]).toContain(">+12%<");
    expect(cards["Últimos 7 dias"]).toContain("text-emerald-600");
    expect(cards["Últimos 7 dias"]).toContain("12% acima do período anterior");
    expect(cards["Últimos 30 dias"]).toContain(">-8%<");
    expect(cards["Últimos 30 dias"]).toContain("text-red-600");
    expect(cards["Últimos 30 dias"]).toContain("8% abaixo do período anterior");
    expect(cards["Orçamentos novos"]).toContain(">0%<");
    expect(cards["Orçamentos novos"]).toContain("igual ao período anterior");
  });

  it("mostra traco sem base e nunca fala de ano anterior", () => {
    const html = renderToStaticMarkup(
      <NotificationListSummaryCards
        summary={{ ...summary, newProposals: 0, change: { last7Days: null, last30Days: 5, newProposals: null } }}
      />,
    );
    const cards = cardSlices(html);
    expect(cards["Últimos 7 dias"]).toContain("—");
    expect(cards["Últimos 7 dias"]).toContain("sem comparação com o período anterior");
    expect(cards["Orçamentos novos"]).toContain("—");
    expect(html).not.toContain("Infinity");
    expect(html).not.toContain("ano anterior");
  });

  it("nao mostra variacao em nao lidas", () => {
    const cards = cardSlices(renderToStaticMarkup(<NotificationListSummaryCards summary={summary} />));
    expect(cards["Não lidas"]).toContain(">16<");
    expect(cards["Não lidas"]).not.toContain("%");
    expect(cards["Não lidas"]).not.toContain("—");
  });

  it("deixa os cantos vazios quando o backend ainda nao manda a variacao", () => {
    const { change: _change, ...legacy } = summary;
    const html = renderToStaticMarkup(<NotificationListSummaryCards summary={legacy} />);
    expect(html).toContain(">111<");
    expect(html).not.toContain("%");
    expect(html).not.toContain("—");
  });
});
