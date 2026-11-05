import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GoalsPanelSummary } from "./GoalsPanelSummary";
import { EMPTY_PANEL_LABEL, formatPanelMoney } from "./goals-panel-metrics";

const year = "1,2,3,4,5,6,7,8,9,10,11,12";

function markup(overrides: Partial<Parameters<typeof GoalsPanelSummary>[0]> = {}) {
  return renderToStaticMarkup(
    <GoalsPanelSummary
      venueLoading={false}
      venueError={null}
      venue={{ pricingModel: "PER_PERSON", pricePerPerson: 100, minimumPrice: 2500 }}
      goalsLoading={false}
      goalsError={null}
      goals={[{ minValue: 10000, months: year }]}
      feesLoading={false}
      feesError={null}
      surchargeCount={3}
      discountCount={3}
      {...overrides}
    />,
  );
}

describe("cards de resumo do painel", () => {
  it("mostra os cinco indicadores na ordem, com a meta anual calculada", () => {
    const html = markup();
    const labels = ["Preço por Pessoa", "Meta anual", "Adicionais ativos", "Descontos ativos", "Mínimo padrão"];
    let cursor = -1;
    for (const label of labels) {
      const index = html.indexOf(label);
      expect(index).toBeGreaterThan(cursor);
      cursor = index;
    }
    expect(html).toContain(formatPanelMoney(100));
    expect(html).toContain(formatPanelMoney(120000));
    expect(html).toContain(formatPanelMoney(2500));
    expect(html).toContain(">3</p>");
    expect(html).not.toContain(EMPTY_PANEL_LABEL);
  });

  it("troca numero ausente pela frase de vazio", () => {
    const html = markup({
      venue: null,
      goals: [],
      surchargeCount: 0,
      discountCount: 0,
    });
    expect(html.match(new RegExp(EMPTY_PANEL_LABEL, "g"))?.length).toBe(5);
    expect(html).not.toContain(">0</p>");
    expect(html).toContain("Preço atual");
  });

  it("nao usa a frase de vazio enquanto carrega ou quando a leitura falha", () => {
    const loading = markup({
      venueLoading: true,
      goalsLoading: true,
      feesLoading: true,
      venue: null,
      goals: [],
      surchargeCount: 0,
      discountCount: 0,
    });
    expect(loading).not.toContain(EMPTY_PANEL_LABEL);
    expect(loading).toContain("animate-pulse");

    const failed = markup({
      venueError: "Não foi possível carregar o espaço.",
      goalsError: "Não foi possível carregar as metas.",
      feesError: "Não foi possível carregar os adicionais.",
      venue: null,
      goals: [],
      surchargeCount: 0,
      discountCount: 0,
    });
    expect(failed).not.toContain(EMPTY_PANEL_LABEL);
    expect(failed).toContain("Não foi possível carregar o espaço.");
    expect(failed).toContain("Não foi possível carregar as metas.");
  });
});
