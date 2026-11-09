import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PillIndicator, SeriesToggle } from "./SlidingSelection";

describe("indicador deslizante dos toggles", () => {
  it("move a pilula com transform e respeita reduced motion", () => {
    const html = renderToStaticMarkup(<PillIndicator box={{ x: 4, y: 4, width: 96, height: 32 }} />);

    expect(html).toContain("translate3d(4px, 4px, 0)");
    expect(html).toContain("transition-[transform,width,height]");
    expect(html).toContain("duration-200");
    expect(html).toContain("motion-reduce:transition-none");
    expect(html).toContain('aria-hidden="true"');
  });

  it("mostra as duas series com a primeira pressionada", () => {
    const html = renderToStaticMarkup(
      <SeriesToggle
        label="Série do gráfico"
        value="quantity"
        onChange={() => undefined}
        options={[
          { value: "quantity", label: "Orçamentos" },
          { value: "conversion", label: "Taxa de conversão" },
        ]}
      />,
    );

    expect(html).toContain("Orçamentos");
    expect(html).toContain("Taxa de conversão");
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-label="Série do gráfico"');
  });
});
