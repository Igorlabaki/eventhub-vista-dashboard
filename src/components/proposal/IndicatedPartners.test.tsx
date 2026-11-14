import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { IndicatedPartnersSummary } from "./IndicatedPartnersSummary";
import { IndicatedPartnersTable } from "./IndicatedPartnersTable";
import { Contact } from "@/types/contact";

const contacts: Contact[] = [
  { id: "a", name: "Adenilma", role: "Creperia", category: "BUFFET", venueId: "v" },
  { id: "b", name: "BBQ.HB", category: null, venueId: "v" },
];

function rowOf(html: string, name: string) {
  const start = html.lastIndexOf("<tr", html.indexOf(`>${name}<`));
  return html.slice(start, html.indexOf("</tr>", start));
}

describe("tabela de parceiros indicados", () => {
  it("pinta de verde e marca so a linha indicada", () => {
    const html = renderToStaticMarkup(
      <IndicatedPartnersTable contacts={contacts} selectedIds={["a"]} onToggle={() => {}} />,
    );
    const indicated = rowOf(html, "Adenilma");
    const other = rowOf(html, "BBQ.HB");

    expect(indicated).toContain("bg-emerald-50");
    expect(indicated).toContain('data-state="checked"');
    expect(other).not.toContain("bg-emerald-50");
    expect(other).toContain('data-state="unchecked"');
  });

  it("mostra a categoria do parceiro e traco sem funcao", () => {
    const html = renderToStaticMarkup(
      <IndicatedPartnersTable contacts={contacts} selectedIds={[]} onToggle={() => {}} />,
    );
    expect(rowOf(html, "Adenilma")).toContain(">Buffet<");
    expect(rowOf(html, "Adenilma")).toContain(">Creperia<");
    expect(rowOf(html, "BBQ.HB")).toContain(">Outros<");
    expect(rowOf(html, "BBQ.HB")).toContain(">—<");
  });
});

describe("KPIs de parceiros indicados", () => {
  it("mostra total, indicados e nao indicados sem ficar negativo", () => {
    const html = renderToStaticMarkup(<IndicatedPartnersSummary total={41} indicated={3} />);
    expect(html).toContain(">41<");
    expect(html).toContain(">3<");
    expect(html).toContain(">38<");

    const stale = renderToStaticMarkup(<IndicatedPartnersSummary total={0} indicated={2} />);
    expect(stale).not.toContain(">-2<");
  });
});
