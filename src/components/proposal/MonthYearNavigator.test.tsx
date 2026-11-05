import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MonthYearNavigator } from "./MonthYearNavigator";

const monthNames = ["Jan", "Fev", "Mar"];

describe("navegador de ano e mes", () => {
  it("nao mostra Todos quando a tela nao pede o ano inteiro", () => {
    const html = renderToStaticMarkup(
      <MonthYearNavigator
        selectedYear={2026}
        selectedMonth={0}
        monthNames={monthNames}
        onYearChange={() => undefined}
        onMonthChange={() => undefined}
      />,
    );
    expect(html).not.toContain("Anual");
    expect(html).toContain(">Jan<");
  });
});
