import { describe, expect, it } from "vitest";
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

  it("escolhe a visao geral como primeiro destino quando ela esta permitida", () => {
    const allowed = flatNavItems(
      visibleSections(venueSections, allow(Permissions.VIEW_VENUE_INFO, Permissions.VIEW_VENUE_NOTIFICATIONS)),
      null,
    );
    expect(itemHref("/venue/ar756", allowed[0].path)).toBe("/venue/ar756");
  });
});
