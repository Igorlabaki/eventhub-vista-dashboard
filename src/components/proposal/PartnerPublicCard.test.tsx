import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PartnerPublicCard } from "./PartnerPublicCard";

const filled = {
  name: "Casa Doce",
  description: "Bolos finos",
  logoUrl: "https://cdn.example/logo.webp",
  whatsapp: "11988887777",
  email: "",
  instagramUrl: "https://instagram.com/casadoce",
  facebookUrl: "",
  tiktokUrl: "",
  url: "",
};

describe("PartnerPublicCard", () => {
  it("preview mostra avatar, nome, descricao e so as redes preenchidas", () => {
    const html = renderToStaticMarkup(<PartnerPublicCard variant="preview" {...filled} />);
    const avatar = html.indexOf("cdn.example/logo.webp");
    const name = html.indexOf("Casa Doce");
    const description = html.indexOf("Bolos finos");
    const instagram = html.indexOf("Instagram");
    expect(avatar).toBeGreaterThan(-1);
    expect(avatar).toBeLessThan(name);
    expect(name).toBeLessThan(description);
    expect(description).toBeLessThan(instagram);
    expect(html).toContain('href="https://wa.me/11988887777"');
    expect(html).toContain('href="https://instagram.com/casadoce"');
    expect(html).toContain('target="_blank"');
    expect(html).not.toContain("Facebook");
    expect(html).not.toContain("TikTok");
    expect(html).not.toContain("Site");
    expect(html).not.toContain("E-mail");
  });

  it("preview abre a URL digitada e completa o protocolo", () => {
    const html = renderToStaticMarkup(
      <PartnerPublicCard
        variant="preview"
        name="Casa Doce"
        whatsapp="(11) 98888-7777"
        email="oi@casa.test"
        instagramUrl="casadoce"
        facebookUrl="https://facebook.com/casadoce"
        tiktokUrl="@casadoce"
        url="casadoce.com.br"
      />,
    );
    expect(html).toContain('href="https://wa.me/11988887777"');
    expect(html).toContain('href="mailto:oi@casa.test"');
    expect(html).toContain('href="https://instagram.com/casadoce"');
    expect(html).toContain('href="https://facebook.com/casadoce"');
    expect(html).toContain('href="https://www.tiktok.com/@casadoce"');
    expect(html).toContain('href="https://casadoce.com.br"');
    expect(html.match(/<a /g)).toHaveLength(6);
    expect(html.match(/target="_blank"/g)).toHaveLength(5);
  });

  it("preview vazio usa os textos de espera e um circulo sem inicial", () => {
    const html = renderToStaticMarkup(<PartnerPublicCard variant="preview" name="   " description="" />);
    expect(html).toContain("Seu nome");
    expect(html).toContain("Descrição do serviço");
    expect(html).not.toContain("<img");
    expect(html).not.toContain(">S<");
    expect(html).not.toContain("<a ");
  });

  it("card publico esconde descricao vazia, usa a inicial e liga as redes", () => {
    const html = renderToStaticMarkup(
      <PartnerPublicCard variant="public" name="Casa Doce" description="  " whatsapp="11988887777" />,
    );
    expect(html).toContain(">C<");
    expect(html).toContain("bg-neutral-200");
    expect(html).not.toContain("Descrição do serviço");
    expect(html).not.toContain("Seu nome");
    expect(html).toContain("<a ");
    expect(html).toContain('aria-label="WhatsApp"');
    expect(html).not.toContain("Buffet");
  });

  it("circulo sem logo usa a cor primaria no fundo e a cor do texto na inicial", () => {
    const html = renderToStaticMarkup(
      <PartnerPublicCard
        variant="public"
        name="Casa Doce"
        avatarStyle={{ backgroundColor: "#112233", color: "#f7f7f5" }}
      />,
    );
    expect(html).toContain("background-color:#112233");
    expect(html).toContain("color:#f7f7f5");
    expect(html).toContain(">C<");
    expect(html).not.toContain("bg-neutral-200");
  });
});
