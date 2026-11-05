import type { ElementType } from "react";
import { Permissions } from "@/types/permissions";

export type CollapsedNavMode = "always-open" | "all";

export interface SidebarNavItemModel {
  title: string;
  path: string;
  permission?: Permissions;
  opensExternalUrl?: boolean;
}

export interface SidebarNavSectionModel {
  id: string;
  title: string;
  alwaysOpen: boolean;
  items: SidebarNavItemModel[];
}

export const venueSections: SidebarNavSectionModel[] = [
  {
    id: "dia-a-dia",
    title: "Dia a dia",
    alwaysOpen: true,
    items: [
      { title: "Visão Geral", path: "", permission: Permissions.VIEW_VENUE_INFO },
      { title: "Orçamentos", path: "/budgets", permission: Permissions.VIEW_VENUE_PROPOSALS },
      { title: "Agenda", path: "/schedule", permission: Permissions.VIEW_VENUE_CALENDAR },
      { title: "Eventos", path: "/events", permission: Permissions.VIEW_VENUE_EVENTS },
      { title: "Notificações", path: "/notifications", permission: Permissions.VIEW_VENUE_NOTIFICATIONS },
    ],
  },
  {
    id: "comercial",
    title: "Comercial",
    alwaysOpen: false,
    items: [
      { title: "Metas/Preços", path: "/goals", permission: Permissions.VIEW_VENUE_PRICES },
      { title: "Serviços", path: "/services", permission: Permissions.VIEW_VENUE_SERVICES },
      { title: "Despesas", path: "/expenses", permission: Permissions.VIEW_VENUE_EXPENSES },
      { title: "Relatórios", path: "/reports", permission: Permissions.VIEW_VENUE_ANALYSIS },
      { title: "Contatos", path: "/contacts", permission: Permissions.VIEW_VENUE_CONTACTS },
    ],
  },
  {
    id: "a-casa",
    title: "A casa",
    alwaysOpen: false,
    items: [
      { title: "Site", path: "/website", permission: Permissions.VIEW_VENUE_SITES },
      { title: "Regras", path: "/rules", permission: Permissions.VIEW_VENUE_RULES },
      { title: "Características", path: "/amenities", permission: Permissions.VIEW_VENUE_AMENITIES },
    ],
  },
];

export const venueSettingsItem: SidebarNavItemModel = {
  title: "Configurações",
  path: "/settings",
  permission: Permissions.VIEW_VENUE_CONFIG,
};

export const proposalSections: SidebarNavSectionModel[] = [
  {
    id: "orcamento",
    title: "Orçamento",
    alwaysOpen: true,
    items: [
      { title: "Visão Geral", path: "", permission: Permissions.VIEW_PROPOSAL_INFO },
      { title: "Editar", path: "/edit", permission: Permissions.EDIT_VENUE_PROPOSALS },
      { title: "Ver Histórico", path: "/history", permission: Permissions.VIEW_PROPOSAL_HISTORY },
    ],
  },
  {
    id: "falar-com-o-cliente",
    title: "Falar com o cliente",
    alwaysOpen: false,
    items: [
      { title: "Entrar em contato", path: "/send-message", permission: Permissions.SEND_PROPOSAL_TEXT },
      { title: "Enviar Orçamento", path: "/send-proposal", permission: Permissions.SEND_PROPOSAL_INFO },
      { title: "Link do evento", path: "/event-link", permission: Permissions.SEND_PROPOSAL_INFO, opensExternalUrl: true },
      { title: "Indicar parceiros", path: "/send-suppliers", permission: Permissions.SEND_PROPOSAL_INFO },
    ],
  },
  {
    id: "fechar",
    title: "Fechar",
    alwaysOpen: false,
    items: [
      { title: "Gerar Contrato", path: "/contract", permission: Permissions.SEND_PROPOSAL_INFO },
      { title: "Agendar Data", path: "/dates", permission: Permissions.VIEW_PROPOSAL_DATES },
      { title: "Efetuar Pagamento", path: "/payment", permission: Permissions.VIEW_PROPOSAL_PAYMENTS },
    ],
  },
  {
    id: "no-dia",
    title: "No dia",
    alwaysOpen: false,
    items: [
      { title: "Lista de Presença", path: "/attendance-list", permission: Permissions.VIEW_PROPOSAL_ATTENDANCE_LIST },
      { title: "Programação", path: "/schedule", permission: Permissions.VIEW_PROPOSAL_SCHEDULE },
      { title: "Documentos", path: "/documents", permission: Permissions.VIEW_PROPOSAL_DOCUMENTS },
    ],
  },
];

export const organizationSections: SidebarNavSectionModel[] = [
  {
    id: "operacao",
    title: "Operação",
    alwaysOpen: true,
    items: [
      { title: "Espaços", path: "/venues", permission: Permissions.VIEW_ORG_VENUES },
    ],
  },
  {
    id: "marca",
    title: "Marca",
    alwaysOpen: true,
    items: [
      { title: "Site", path: "/website", permission: Permissions.VIEW_ORG_SITE },
      { title: "Contratos", path: "/contracts", permission: Permissions.VIEW_ORG_CONTRACTS },
    ],
  },
  {
    id: "acesso",
    title: "Acesso",
    alwaysOpen: true,
    items: [
      { title: "Permissões", path: "/permissions", permission: Permissions.VIEW_ORG_PERMISSIONS },
      { title: "Proprietários", path: "/owners", permission: Permissions.VIEW_ORG_OWNERS },
    ],
  },
];

export const organizationSettingsItem: SidebarNavItemModel = {
  title: "Configurações",
  path: "/settings",
  permission: Permissions.VIEW_ORG_INFO,
};

export function itemHref(base: string, path: string): string {
  return `${base}${path}`;
}

export function internalItemHref(base: string, item: SidebarNavItemModel): string | null {
  if (item.opensExternalUrl) return null;
  return itemHref(base, item.path);
}

export interface PresentedNavItem {
  title: string;
  href: string;
  icon: ElementType;
  external?: boolean;
}

export function presentNavItems(
  items: SidebarNavItemModel[],
  base: string,
  icons: Record<string, ElementType>,
  externalHref?: (item: SidebarNavItemModel) => string | null,
): PresentedNavItem[] {
  return items.flatMap((item) => {
    const icon = icons[item.title];
    if (!icon) {
      throw new Error(`Icone ausente para o item ${item.title}`);
    }
    if (item.opensExternalUrl) {
      const href = externalHref?.(item) ?? null;
      if (!href) return [];
      return [{ title: item.title, href, icon, external: true }];
    }
    return [{ title: item.title, href: itemHref(base, item.path), icon }];
  });
}

export function visibleSections(
  sections: SidebarNavSectionModel[],
  canSee: (permission?: Permissions) => boolean,
): SidebarNavSectionModel[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canSee(item.permission)),
    }))
    .filter((section) => section.items.length > 0);
}

export function flatNavItems(
  sections: SidebarNavSectionModel[],
  settings?: SidebarNavItemModel | null,
): SidebarNavItemModel[] {
  const items = sections.flatMap((section) => section.items);
  return settings ? [...items, settings] : items;
}

export function itemsWhenCollapsed<T extends { alwaysOpen: boolean; items: U[] }, U>(
  sections: T[],
  mode: CollapsedNavMode,
): U[] {
  const source = mode === "all" ? sections : sections.filter((section) => section.alwaysOpen);
  return source.flatMap((section) => section.items);
}
