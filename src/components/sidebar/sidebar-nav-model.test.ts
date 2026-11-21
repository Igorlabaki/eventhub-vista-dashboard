import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { publicVenuePresentationShareUrl } from "@/lib/public-venue-presentation";
import { Permissions } from "@/types/permissions";
import {
  flatNavItems,
  internalItemHref,
  itemHref,
  presentNavItems,
  itemsWhenCollapsed,
  organizationSections,
  organizationSettingsItem,
  proposalSections,
  venueSections,
  venueSettingsItem,
  visibleSections,
} from "./sidebar-nav-model";

const allow = (...permissions: Permissions[]) => (permission?: Permissions) =>
  permission ? permissions.includes(permission) : false;

describe("sidebar por secoes", () => {
  it("coloca a visao geral como porta do espaco e separa configuracoes", () => {
    expect(venueSections[0].items[0].title).toBe("Visão Geral");
    expect(venueSections[0].items.map((item) => item.title)).toEqual([
      "Visão Geral",
      "Orçamentos",
      "Agenda",
      "Eventos",
      "Notificações",
    ]);
    expect(venueSections.find((section) => section.id === "comercial")?.items.map((item) => item.title)).toEqual([
      "Metas/Preços",
      "Serviços",
      "Despesas",
      "Relatórios",
      "Contatos",
    ]);
    expect(venueSections.find((section) => section.id === "a-casa")?.items.map((item) => item.title)).toEqual([
      "Site",
      "Regras",
      "Características",
      "Fotos",
      "Apresentação",
      "Link tree",
    ]);
    expect(venueSections.flatMap((section) => section.items).some((item) => item.title === "Configurações")).toBe(false);
    expect(itemHref("/venue/ar756", venueSettingsItem.path)).toBe("/venue/ar756/settings");
    expect(itemHref("/venue/ar756", "")).toBe("/venue/ar756");
  });

  it("esconde o grupo quando nenhum item passa da permissao e mantem o resto", () => {
    const visible = visibleSections(
      venueSections,
      allow(Permissions.VIEW_VENUE_INFO, Permissions.VIEW_VENUE_RULES),
    );

    expect(visible.map((section) => section.id)).toEqual(["dia-a-dia", "a-casa"]);
    expect(visible[0].items.map((item) => item.title)).toEqual(["Visão Geral"]);
    expect(visible[1].items.map((item) => item.title)).toEqual(["Regras"]);
  });

  it("no espaco recolhido mostra so o dia a dia", () => {
    const titles = itemsWhenCollapsed(venueSections, "always-open").map((item) => item.title);
    expect(titles).toEqual(["Visão Geral", "Orçamentos", "Agenda", "Eventos", "Notificações"]);
  });

  it("agrupa o orcamento pelo ciclo e a organizacao por rotulos sempre abertos", () => {
    expect(proposalSections.map((section) => section.title)).toEqual([
      "Orçamento",
      "Falar com o cliente",
      "Fechar",
      "No dia",
    ]);
    expect(proposalSections.filter((section) => section.alwaysOpen).map((section) => section.id)).toEqual(["orcamento"]);
    expect(organizationSections.every((section) => section.alwaysOpen)).toBe(true);
    expect(itemsWhenCollapsed(organizationSections, "all").map((item) => item.title)).toEqual([
      "Espaços",
      "Site",
      "Contratos",
      "Permissões",
      "Proprietários",
    ]);
    expect(flatNavItems(organizationSections, organizationSettingsItem).at(-1)?.title).toBe("Configurações");
  });

  it("abre a apresentacao do espaco fora do painel, na mesma permissao do site", () => {
    const item = venueSections
      .flatMap((section) => section.items)
      .find((entry) => entry.title === "Apresentação");
    const icon = () => null;
    const href = publicVenuePresentationShareUrl("AR756");

    expect(item?.permission).toBe(Permissions.VIEW_VENUE_SITES);
    expect(item?.opensExternalUrl).toBe(true);
    expect(internalItemHref("/venue/venue-1", item!)).toBeNull();
    expect(
      presentNavItems([item!], "/venue/venue-1", { Apresentação: icon }, () => href),
    ).toEqual([{ title: "Apresentação", href, icon, external: true }]);
    expect(href).toBe("https://event-hub-dashboard.vercel.app/espaco/AR756/apresentacao");
    expect(presentNavItems([item!], "/venue/venue-1", { Apresentação: icon }, () => null)).toEqual([]);
  });

  it("abre o link tree dentro do painel, sem url externa", () => {
    const item = venueSections
      .flatMap((section) => section.items)
      .find((entry) => entry.title === "Link tree");
    const icon = () => null;
    const app = readFileSync("src/App.tsx", "utf8");

    expect(item?.permission).toBe(Permissions.VIEW_VENUE_SITES);
    expect(item?.opensExternalUrl).toBeUndefined();
    expect(internalItemHref("/venue/venue-1", item!)).toBe("/venue/venue-1/link-tree");
    expect(
      presentNavItems([item!], "/venue/venue-1", { "Link tree": icon }, () => "https://event-hub-dashboard.vercel.app/espaco/AR756/links"),
    ).toEqual([{ title: "Link tree", href: "/venue/venue-1/link-tree", icon }]);
    expect(app).toContain('path="/venue/:id/link-tree" element={<ProtectedRoute requiredPermission="VIEW_VENUE_SITES"><VenueLinkTree /></ProtectedRoute>}');
  });

  it("tira o link do evento do roteador interno e abre a url absoluta", () => {
    const item = proposalSections
      .flatMap((section) => section.items)
      .find((entry) => entry.title === "Link do evento");
    const icon = () => null;
    const href = "https://event-hub-dashboard.vercel.app/proposal/proposal-1/links";

    expect(item?.permission).toBe(Permissions.SEND_PROPOSAL_INFO);
    expect(item?.opensExternalUrl).toBe(true);
    expect(internalItemHref("/proposal/proposal-1", item!)).toBeNull();
    expect(
      presentNavItems([item!], "/proposal/proposal-1", { "Link do evento": icon }, () => href),
    ).toEqual([{ title: "Link do evento", href, icon, external: true }]);
    expect(href).not.toContain("/event-link");
    expect(presentNavItems([item!], "/proposal/proposal-1", { "Link do evento": icon }, () => null)).toEqual([]);
  });

  it("abre contato e orcamento num modal, fora do roteador", () => {
    const icon = () => null;
    const items = proposalSections
      .flatMap((section) => section.items)
      .filter((item) => item.opensDialog);

    expect(items.map((item) => [item.title, item.opensDialog, item.permission])).toEqual([
      ["Entrar em contato", "contact", Permissions.SEND_PROPOSAL_TEXT],
      ["Enviar Orçamento", "proposal", Permissions.SEND_PROPOSAL_INFO],
    ]);
    expect(items.every((item) => internalItemHref("/proposal/proposal-1", item) === null)).toBe(true);
    expect(
      presentNavItems(items, "/proposal/proposal-1", {
        "Entrar em contato": icon,
        "Enviar Orçamento": icon,
      }),
    ).toEqual([
      { title: "Entrar em contato", href: "contact", icon, dialog: "contact" },
      { title: "Enviar Orçamento", href: "proposal", icon, dialog: "proposal" },
    ]);
  });

  it("escolhe a visao geral como primeiro destino quando ela esta permitida", () => {
    const allowed = flatNavItems(
      visibleSections(venueSections, allow(Permissions.VIEW_VENUE_INFO, Permissions.VIEW_VENUE_NOTIFICATIONS)),
      null,
    );
    expect(itemHref("/venue/ar756", allowed[0].path)).toBe("/venue/ar756");
  });
});
