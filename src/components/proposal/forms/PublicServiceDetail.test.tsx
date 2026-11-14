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

  it("sem navegacao, nao mostra setas", () => {
    const html = renderToStaticMarkup(
      <PublicServiceDetailDialog open onOpenChange={() => undefined} name="Painel de Led" description="Led" />,
    );

    expect(html).not.toContain('aria-label="Anterior"');
    expect(html).not.toContain('aria-label="Próximo"');
  });

  it("com navegacao, mostra as setas fora do painel e sem contador", () => {
    const html = renderToStaticMarkup(
      <PublicServiceDetailDialog
        open
        onOpenChange={() => undefined}
        name="Piscina"
        description="Aquecida"
        onPrevious={() => undefined}
        onNext={() => undefined}
      />,
    );

    expect(html).toContain('aria-label="Anterior"');
    expect(html).toContain('aria-label="Próximo"');
    expect(html.indexOf('aria-label="Próximo"')).toBeLessThan(html.indexOf("scrollbar-house"));
    expect(html).not.toContain("aria-live");
  });

  function photoTags(html: string) {
    return [...html.matchAll(/<img[^>]*>/g)].map((match) => match[0]);
  }

  function dialogWith(images: string[]) {
    return renderToStaticMarkup(
      <PublicServiceDetailDialog
        open
        onOpenChange={() => undefined}
        name="Piscina"
        images={images}
        onPrevious={() => undefined}
        onNext={() => undefined}
      />,
    );
  }

  it("uma foto ocupa a largura do grid", () => {
    const tags = photoTags(dialogWith(["https://a"]));
    expect(tags).toHaveLength(1);
    expect(tags[0]).toContain("col-span-2");
    expect(tags[0]).not.toContain("aspect-square");
  });

  it("duas fotos ficam lado a lado", () => {
    const tags = photoTags(dialogWith(["https://a", "https://b"]));
    expect(tags).toHaveLength(2);
    for (const tag of tags) {
      expect(tag).toContain("aspect-square");
      expect(tag).not.toContain("col-span-2");
    }
  });

  it("tres fotos: a primeira em cima, na largura, e duas embaixo, na ordem recebida", () => {
    const html = dialogWith(["https://a", "https://b", "https://c"]);
    const tags = photoTags(html);
    expect(tags.map((tag) => tag.match(/src="([^"]+)"/)?.[1])).toEqual(["https://a", "https://b", "https://c"]);
    expect(tags[0]).toContain("col-span-2");
    expect(tags[0]).toContain("aspect-video");
    expect(tags[1]).toContain("aspect-square");
    expect(tags[2]).toContain("aspect-square");
    expect(html).toContain('aria-label="Próximo"');
  });

  it("ignora foto vazia e, com images, nao usa o imageUrl", () => {
    const html = renderToStaticMarkup(
      <PublicServiceDetailDialog
        open
        onOpenChange={() => undefined}
        name="Piscina"
        images={["  ", "https://a"]}
        imageUrl="https://antiga"
      />,
    );
    expect(photoTags(html)).toHaveLength(1);
    expect(html).not.toContain("https://antiga");
  });

  it("sem images, o modal do servico mostra o imageUrl como antes", () => {
    const tags = photoTags(
      renderToStaticMarkup(
        <PublicServiceDetailDialog open onOpenChange={() => undefined} name="Painel de Led" imageUrl="https://example.com/led.jpg" />,
      ),
    );
    expect(tags).toHaveLength(1);
    expect(tags[0]).toContain("https://example.com/led.jpg");
    expect(tags[0]).toContain("h-auto w-full rounded-md");
  });
});
