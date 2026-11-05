import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GoalsPanelSections, type GoalsPanelSectionsProps } from "./GoalsPanelSections";
import { EMPTY_PANEL_LABEL } from "./goals-panel-metrics";

const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function props(overrides: Partial<GoalsPanelSectionsProps> = {}): GoalsPanelSectionsProps {
  return {
    canEdit: true,
    price: { label: "Preço por Pessoa", price: 100 },
    priceLoading: false,
    priceError: null,
    isEditingPrice: false,
    onEditPrice: () => undefined,
    priceEditor: <form>Salvar preço</form>,
    goals: [
      { id: "g1", minValue: 10000, increasePercent: 10, months: "1,2,13" },
      { id: "g2", minValue: 2, increasePercent: 1, months: "3" },
      { id: "g3", minValue: 3, increasePercent: 1, months: "4" },
      { id: "g4", minValue: 4, increasePercent: 1, months: "5" },
    ],
    goalsLoading: false,
    goalsError: null,
    surcharges: [{ id: "s1", title: "Fim de ano", startDay: "01/12", endDay: "31/12", fee: 80 }],
    discounts: [{ id: "d1", title: "Novembro", startDay: "01/11", endDay: "30/11", fee: 6, affectedDays: "monday" }],
    feesLoading: false,
    feesError: null,
    minimumPrice: 0,
    venueLoading: false,
    venueError: null,
    periods: [{ id: "p1", title: "Dezembro", startDay: "01/12", endDay: "31/12", price: 5000 }],
    periodsLoading: false,
    periodsError: null,
    monthLabels: months,
    translateDays: (value) => `dias:${value}`,
    onOpen: () => undefined,
    onCreateGoal: () => undefined,
    onCreateSurcharge: () => undefined,
    onCreateDiscount: () => undefined,
    onCreatePeriod: () => undefined,
    ...overrides,
  };
}

function markup(overrides: Partial<GoalsPanelSectionsProps> = {}) {
  return renderToStaticMarkup(<GoalsPanelSections {...props(overrides)} />);
}

describe("secoes do painel de metas", () => {
  it("mostra o modelo fechado e o Editar so com permissao", () => {
    const html = markup();
    expect(html).toContain("Modelo de Precificação");
    expect(html).toContain("O modelo de preço atual para o espaço.");
    expect(html).toContain("Preço por Pessoa");
    expect(html).toContain("Editar");
    expect(html).not.toContain("Salvar preço");

    const locked = markup({ canEdit: false });
    expect(locked).not.toContain("Editar");
    expect(locked).toContain("Preço por Pessoa");
  });

  it("coloca metas ao lado de adicionais no largo e descontos em tres colunas", () => {
    const html = markup();
    expect(html).toContain("lg:grid-cols-2");
    expect(html).toContain("grid-cols-1");
    expect(html).toContain("lg:grid-cols-3");
    expect(html).toContain("Acompanhe a meta de faturamento do espaço.");
    expect(html).toContain("Valores adicionais aplicados em períodos específicos.");
    expect(html).toContain("Valores mínimos aplicados ao espaço.");
    expect(html).toContain("Descontos configurados para períodos e condições específicas.");
  });

  it("aponta Ver todos para a aba que ja existe", () => {
    const html = markup();
    expect(html).toContain('data-panel-tab="metas"');
    expect(html).toContain('data-panel-tab="adicionais"');
    expect(html).toContain('data-panel-tab="minimos"');
    expect(html).toContain('data-panel-tab="descontos"');
    expect(html.match(/Ver todos/g)?.length).toBe(4);
  });

  it("mostra a meta sem barras, so com os meses validos, e limita a amostra a tres", () => {
    const html = markup();
    expect(html.match(/data-panel-item="meta"/g)?.length).toBe(3);
    expect(html).toContain("Jan");
    expect(html).toContain("Fev");
    expect(html).not.toContain(">13<");
    expect(html).toContain("Taxa de aumento");
    expect(html).toContain("+10%");
    expect(html).not.toContain("panel-bars");
    expect(html).toContain("+80%");
    expect(html).toContain("-6%");
    expect(html).toContain("dias:monday");
  });

  it("diz que nao ha nada configurado e oferece criar so com permissao", () => {
    const html = markup({
      canEdit: true,
      price: null,
      goals: [],
      surcharges: [],
      discounts: [],
      periods: [],
      minimumPrice: null,
    });
    expect(html).toContain(EMPTY_PANEL_LABEL);
    expect(html).toContain("Nova Meta");
    expect(html).toContain("Novo Adicional");
    expect(html).toContain("Nova faixa");
    expect(html).toContain("Novo Desconto");

    const locked = markup({
      canEdit: false,
      price: null,
      goals: [],
      surcharges: [],
      discounts: [],
      periods: [],
      minimumPrice: null,
    });
    expect(locked).toContain(EMPTY_PANEL_LABEL);
    expect(locked).not.toContain("Nova Meta");
    expect(locked).not.toContain("Novo Adicional");
    expect(locked).not.toContain("Nova faixa");
    expect(locked).not.toContain("Novo Desconto");
    expect(locked).not.toContain("Editar");
  });

  it("nao usa a frase de vazio no carregamento nem no erro", () => {
    const loading = markup({
      priceLoading: true,
      goalsLoading: true,
      feesLoading: true,
      venueLoading: true,
      periodsLoading: true,
      price: null,
      goals: [],
      surcharges: [],
      discounts: [],
      periods: [],
      minimumPrice: null,
    });
    expect(loading).not.toContain(EMPTY_PANEL_LABEL);
    expect(loading).toContain('data-panel-state="loading"');

    const failed = markup({
      goalsError: "Não foi possível carregar as metas.",
      goals: [],
      feesError: "Não foi possível carregar os adicionais.",
      surcharges: [{ id: "s1", title: "Fim de ano", fee: 80 }],
      minimumPrice: 2500,
    });
    expect(failed).toContain("Não foi possível carregar as metas.");
    expect(failed).toContain("Não foi possível carregar os adicionais.");
    expect(failed).not.toContain("Fim de ano");
    expect(failed).not.toContain(EMPTY_PANEL_LABEL);
  });

  it("mantem a faixa quando o piso padrao nao esta configurado", () => {
    const html = markup({ minimumPrice: 0, periods: [{ id: "p1", title: "Dezembro", startDay: "01/12", endDay: "31/12", price: 5000 }] });
    expect(html).toContain(EMPTY_PANEL_LABEL);
    expect(html).toContain("Dezembro");
    expect(html).toContain("01/12 até 31/12");
  });

  it("abre o formulario de preco que ja existe", () => {
    const html = markup({ isEditingPrice: true });
    expect(html).toContain("Salvar preço");
    expect(html).not.toContain("Editar");
  });
});
