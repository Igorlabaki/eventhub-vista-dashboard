import { describe, expect, it } from "vitest";
import { indicationLinks } from "./indication-links";

describe("indicationLinks", () => {
  it("omite campo vazio e monta WhatsApp, e-mail e redes", () => {
    const links = indicationLinks({
      id: "1",
      name: "Casa Doce",
      role: "  ",
      whatsapp: "+55 (11) 98888-7777",
      email: "  ",
      instagramUrl: "https://instagram.com/casadoce",
      facebookUrl: null,
      tiktokUrl: "",
      url: "https://casadoce.example",
    });

    expect(links).toEqual([
      { label: "WhatsApp", href: "https://wa.me/5511988887777", external: true },
      { label: "Instagram", href: "https://instagram.com/casadoce", external: true },
      { label: "Site", href: "https://casadoce.example", external: true },
    ]);
  });

  it("completa o protocolo para o link nao abrir dentro do EventHub", () => {
    const links = indicationLinks({
      id: "2",
      name: "Chef cuca",
      instagramUrl: "instagram.com/chefcuca",
      facebookUrl: "@pagina",
      tiktokUrl: "chefcuca",
      url: "chefcuca.com.br",
    });

    expect(links.map((link) => link.href)).toEqual([
      "https://instagram.com/chefcuca",
      "https://facebook.com/pagina",
      "https://www.tiktok.com/@chefcuca",
      "https://chefcuca.com.br",
    ]);
  });
});
