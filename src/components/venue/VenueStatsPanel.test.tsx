import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VenueStatsPanel } from "./VenueStatsPanel";
import { VenueDashboardData } from "@/types/venue";

const months = [
  "Todas",
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

const data: VenueDashboardData = {
  totalEventsInYear: 0,
  eventsThisMonth: 2,
  proposalsInMonth: 245,
  proposalsVariation: { value: 40, isPositive: true },
  totalVisits: 4,
  visitsVariation: { value: 0, isPositive: true },
  monthlyRevenue: 9089,
  revenueVariation: { value: 0, isPositive: true },
  monthlyRevenueList: null,
  nextEvent: null,
  nextVisit: null,
  proposalYears: [2026],
  sameMonthRevenueByYear: null,
};

function markup(selectedMonth = "11", selectedYear = 2026, numbersLoading = false) {
  return renderToStaticMarkup(
    <VenueStatsPanel
      data={data}
      selectedMonth={selectedMonth}
      selectedYear={selectedYear}
      onMonthChange={() => undefined}
      onYearChange={() => undefined}
      months={months}
      numbersLoading={numbersLoading}
    />,
  );
}

describe("seletor de ano e mes da visao geral", () => {
  it("mostra o ano e os doze meses, com o mes escolhido marcado", () => {
    const html = markup();
    expect(html).toContain(">2026<");
    for (const month of ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]) {
      expect(html).toContain(`>${month}<`);
    }
    const dezembro = html.indexOf(">Dez<");
    const anual = html.indexOf(">Anual<");
    expect(anual).toBeGreaterThan(dezembro);
    expect(html.slice(dezembro, anual)).not.toContain("bg-primary");
    expect(html).toContain("bg-primary text-white");
    expect(html).not.toContain("<select");
    expect(html).not.toContain("Todas");
  });

  it("marca Anual, soma a receita do ano e deixa os meses sem selecao", () => {
    const html = renderToStaticMarkup(
      <VenueStatsPanel
        data={{
          ...data,
          monthlyRevenue: 9089,
          monthlyRevenueList: [
            { month: 1, revenue: 100 },
            { month: 2, revenue: 50 },
          ],
        }}
        selectedMonth="all"
        selectedYear={2026}
        onMonthChange={() => undefined}
        onYearChange={() => undefined}
        months={months}
      />,
    );
    const dezembro = html.indexOf(">Dez<");
    const anual = html.indexOf(">Anual<");
    expect(html.slice(0, dezembro)).not.toContain("bg-primary");
    expect(html.slice(dezembro, anual)).toContain("bg-primary text-white");
    expect(html).toContain("Receita Anual");
    expect(html).toContain("R$ 150,00");
    expect(html).not.toContain("R$ 9.089,00");
  });

  it("marca janeiro quando o painel pede o mes 1", () => {
    const html = markup("1");
    const january = html.indexOf(">Jan<");
    const february = html.indexOf(">Fev<");
    expect(html.slice(0, january)).toContain("bg-primary text-white");
    expect(html.slice(january, february)).not.toContain("bg-primary");
  });

  it("coloca o seletor num container e cada indicador num card com icone a esquerda", () => {
    const html = markup();
    const firstCard = html.indexOf("rounded-2xl");
    expect(html.slice(0, firstCard)).toContain("rounded-3xl");
    expect(html.slice(0, firstCard)).toContain(">2026<");
    expect(html.match(/rounded-2xl/g)).toHaveLength(4);
    expect(html).toContain("h-11 w-11");
    expect(html).toContain("bg-violet-100 text-violet-600");
    expect(html).toContain("bg-emerald-100 text-emerald-600");
    const label = html.indexOf("Eventos");
    const number = html.indexOf(">2<");
    expect(label).toBeGreaterThan(firstCard);
    expect(number).toBeGreaterThan(label);
  });

  it("mantem o seletor e os titulos e esconde os numeros enquanto o periodo carrega", () => {
    const html = markup("11", 2026, true);
    expect(html).toContain(">2026<");
    expect(html).toContain(">Nov<");
    for (const title of ["Eventos", "Orçamentos", "Visitas Agendadas", "Receita Mensal"]) {
      expect(html).toContain(title);
    }
    expect(html.match(/animate-pulse/g)).toHaveLength(4);
    expect(html).not.toContain(">2<");
    expect(html).not.toContain(">245<");
    expect(html).not.toContain(">4<");
    expect(html).not.toContain("R$");
    expect(html).not.toContain("40%");
  });
});
