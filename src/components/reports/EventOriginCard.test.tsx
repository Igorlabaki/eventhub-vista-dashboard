import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { EventOriginData } from "@/types/venue";
import { EventOriginView, originCardRetry } from "./EventOriginCard";

const data: EventOriginData = {
  year: 2026,
  events: 3,
  cities: [
    { label: "Sao Paulo", count: 2 },
    { label: "Campinas", count: 1 },
  ],
  states: [{ label: "SP", count: 3 }],
  neighborhoods: [
    { label: "Centro", count: 2 },
    { label: "Cambuí", count: 1 },
  ],
};

describe("De onde vem os eventos", () => {
  it("lista cidade, estado e bairro na ordem recebida", () => {
    const html = renderToStaticMarkup(
      <EventOriginView year={2026} data={data} isLoading={false} error={null} onRetry={() => undefined} />,
    );

    expect(html).toContain("De onde vem os eventos");
    expect(html).toContain("3 eventos aprovados em 2026");
    expect(html).toContain("lg:grid-cols-3");
    expect(html.indexOf("Sao Paulo")).toBeLessThan(html.indexOf("Campinas"));
    expect(html.indexOf("Centro")).toBeLessThan(html.indexOf("Cambuí"));
    expect(html).toContain(">2<");
    expect(html).not.toContain("street");
    expect(html).not.toContain("cep");
  });

  it("ano sem evento mostra o vazio e esconde as listas", () => {
    const html = renderToStaticMarkup(
      <EventOriginView
        year={2026}
        data={{ year: 2026, events: 0, cities: [], states: [], neighborhoods: [] }}
        isLoading={false}
        error={null}
        onRetry={() => undefined}
      />,
    );

    expect(html).toContain("Nenhum registro neste periodo.");
    expect(html).not.toContain("Cidades");
  });

  it("erro mostra Tentar de novo e o retry chama refetch", () => {
    const html = renderToStaticMarkup(
      <EventOriginView year={2026} isLoading={false} error={new Error("falha")} onRetry={() => undefined} />,
    );
    const refetch = vi.fn();

    expect(html).toContain("Tentar de novo");
    expect(html).not.toContain("Cidades");
    originCardRetry(refetch)();
    expect(refetch).toHaveBeenCalledOnce();
  });

  it("fica abaixo do grid de servicos e porte, na largura da aba", () => {
    const source = readFileSync(new URL("./EventsReport.tsx", import.meta.url), "utf8");
    const gridEnd = source.indexOf("</div>", source.indexOf("lg:grid-cols-2"));
    const card = source.indexOf("<EventOriginCard");

    expect(card).toBeGreaterThan(gridEnd);
    expect(source.indexOf("lg:grid-cols-2")).toBeLessThan(card);
  });
});