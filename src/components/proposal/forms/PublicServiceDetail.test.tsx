import type { ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PublicServiceDetailDialog } from "./PublicServiceDetail";

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: ComponentProps<"div">) => <>{children}</>,
  DialogContent: (props: ComponentProps<"div">) => <div data-testid="content" {...props} />,
  DialogTitle: (props: ComponentProps<"h2">) => <h2 {...props} />,
  DialogDescription: (props: ComponentProps<"p">) => <p {...props} />,
}));

describe("PublicServiceDetailDialog", () => {
  it("rola com a barra nas cores da casa", () => {
    const html = renderToStaticMarkup(
      <PublicServiceDetailDialog
        open
        onOpenChange={() => undefined}
        name="Painel de Led"
        imageUrl="https://example.com/led.jpg"
        surfaceStyle={{ backgroundColor: "#181818", color: "#f5f5f5" }}
      />,
    );

    expect(html).toContain("scrollbar-house");
    expect(html).toContain("overflow-y-auto");
    expect(html).toContain("color:#f5f5f5");
    expect(html).not.toContain("<iframe");
  });

  it("mostra foto, descricao e player do YouTube juntos", () => {
    const html = renderToStaticMarkup(
      <PublicServiceDetailDialog
        open
        onOpenChange={() => undefined}
        name="Piscina"
        description="Aquecida o ano todo"
        imageUrl="https://example.com/piscina.jpg"
        videoUrl="https://www.youtube.com/shorts/dQw4w9WgXcQ"
      />,
    );

    expect(html).toContain("https://example.com/piscina.jpg");
    expect(html).toContain("Aquecida o ano todo");
    expect(html).toContain('src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0"');
    expect(html).not.toContain("autoplay=1");
    expect(html.indexOf("Aquecida o ano todo")).toBeLessThan(html.indexOf("<iframe"));
  });

  it("nao monta player com link invalido e nunca usa a URL crua", () => {
    const html = renderToStaticMarkup(
      <PublicServiceDetailDialog
        open
        onOpenChange={() => undefined}
        name="Piscina"
        description="Aquecida"
        videoUrl="https://cdn.example.com/tour.mp4"
      />,
    );

    expect(html).toContain("Aquecida");
    expect(html).not.toContain("<iframe");
    expect(html).not.toContain("tour.mp4");
  });

  it("sem navegacao, nao mostra setas nem contador", () => {
    const html = renderToStaticMarkup(
      <PublicServiceDetailDialog open onOpenChange={() => undefined} name="Painel de Led" description="Led" />,
    );

    expect(html).not.toContain('aria-label="Anterior"');
    expect(html).not.toContain('aria-label="Próximo"');
    expect(html).not.toContain("aria-live");
  });

  it("com navegacao, mostra setas e a posicao", () => {
    const html = renderToStaticMarkup(
      <PublicServiceDetailDialog
        open
        onOpenChange={() => undefined}
        name="Piscina"
        description="Aquecida"
        onPrevious={() => undefined}
        onNext={() => undefined}
        position={{ current: 2, total: 5 }}
      />,
    );

    expect(html).toContain('aria-label="Anterior"');
    expect(html).toContain('aria-label="Próximo"');
    expect(html).toContain("2 de 5");
  });
});
