import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { venueCardBrand } from "@/lib/venue-card-brand";
import { VenueCard, type VenueCardProps } from "./VenueCard";

const base: VenueCardProps = {
  id: "venue-1",
  name: "AR756",
  nextEvent: null,
  upcomingEvents: 0,
  organizationId: "org-1",
};

function render(props: Partial<VenueCardProps> = {}) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <VenueCard {...base} {...props} />
    </MemoryRouter>,
  );
}

describe("VenueCard com a marca do espaco", () => {
  it("logo no lugar do nome, com o nome no alt", () => {
    const html = render({ logoUrl: "https://cdn.example/ar756.webp" });
    expect(html).toContain('src="https://cdn.example/ar756.webp"');
    expect(html).toContain('alt="AR756"');
    expect(html).not.toContain(">AR756<");
  });

  it("o card inteiro e o clicavel, sem botao nem link interno", () => {
    const html = render({ logoUrl: "https://cdn.example/ar756.webp" });
    expect(html).toContain('role="link"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('aria-label="Gerenciar AR756"');
    expect(html).toContain("cursor-pointer");
    expect(html).not.toContain("<button");
    expect(html).not.toContain("<a ");
    expect(html).not.toContain("Gerenciar Espaço");
  });

  it("primaria no fundo, secundaria no quadro e na borda, cor de texto na fonte", () => {
    const html = render({
      primaryColor: "#112233",
      secondaryColor: "#445566",
      textColor: "#f7f7f5",
    });
    expect(html).toContain("background-color:#112233;color:#f7f7f5;border-left-color:#445566");
    expect(html.match(/background-color:#445566;color:#f7f7f5/g)).toHaveLength(1);
    expect(html).toContain("hover:brightness-95");
    expect(html).not.toContain("text-gray-500");
  });

  it("sem logo e sem cores o card fica como hoje", () => {
    const html = render();
    expect(html).toContain(">AR756<");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("background-color");
    expect(html).not.toContain("hover:brightness-95");
    expect(html).toContain("border-l-eventhub-primary");
    expect(html).toContain("text-gray-500");
  });

  it("so logo mantem o card atual e troca o nome pelo logo", () => {
    const html = render({ logoUrl: "https://cdn.example/ar756.webp" });
    expect(html).not.toContain("background-color");
    expect(html).toContain("border-l-eventhub-primary");
  });

  it("so cores mostra o nome e aplica as cores", () => {
    const html = render({ primaryColor: "#112233", secondaryColor: "#445566", textColor: "#ffffff" });
    expect(html).toContain(">AR756<");
    expect(html).toContain("background-color:#112233");
  });
});

describe("venueCardBrand", () => {
  it("sem nenhuma cor nao aplica marca", () => {
    expect(venueCardBrand({})).toBeNull();
    expect(venueCardBrand({ primaryColor: "", secondaryColor: null, textColor: undefined })).toBeNull();
  });

  it("cor que falta usa o fallback das paginas publicas para aquele papel", () => {
    expect(venueCardBrand({ primaryColor: "#112233" })).toEqual({
      card: { backgroundColor: "#112233", color: "#f7f7f5", borderLeftColor: "#ffffff" },
      inner: { backgroundColor: "#ffffff", color: "#181818" },
    });
  });
});
