import { useEffect } from "react";
import type { ElementType } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bell,
  Calendar,
  CalendarDays,
  ClipboardList,
  Contact,
  Globe,
  LayoutDashboard,
  ListChecks,
  Receipt,
  Settings,
  Sparkles,
  Target,
  Wrench,
} from "lucide-react";
import { Venue } from "@/types";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import { Permissions } from "@/types/permissions";
import { SectionedNav } from "@/components/sidebar/SectionedNav";
import {
  flatNavItems,
  itemHref,
  presentNavItems,
  venueSections,
  venueSettingsItem,
  visibleSections,
} from "@/components/sidebar/sidebar-nav-model";

interface VenueNavProps {
  isCollapsed: boolean;
  onNavItemClick: () => void;
  venue: Venue;
  hold?: boolean;
}

const venueIcons: Record<string, ElementType> = {
  "Visão Geral": LayoutDashboard,
  "Orçamentos": ClipboardList,
  Agenda: CalendarDays,
  Eventos: Calendar,
  "Notificações": Bell,
  "Metas/Preços": Target,
  Serviços: Wrench,
  Despesas: Receipt,
  Relatórios: BarChart,
  Contatos: Contact,
  Site: Globe,
  Regras: ListChecks,
  Características: Sparkles,
  Configurações: Settings,
};

export function VenueNav({
  isCollapsed,
  onNavItemClick,
  venue,
  hold = false,
}: VenueNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUserVenuePermission } = useUserVenuePermissionStore();
  const permissions = currentUserVenuePermission?.permissions;
  const base = `/venue/${venue.id}`;

  const canSee = (permission?: Permissions) => {
    if (!permission || !permissions) return false;
    return permissions.includes(permission);
  };

  const sections = visibleSections(venueSections, canSee);
  const settings = canSee(venueSettingsItem.permission) ? venueSettingsItem : null;

  useEffect(() => {
    if (hold || !venue.id || !permissions) return;

    const allowed = flatNavItems(visibleSections(venueSections, (permission) => {
      if (!permission) return false;
      return permissions.includes(permission);
    }), permissions.includes(Permissions.VIEW_VENUE_CONFIG) ? venueSettingsItem : null);

    const current = allowed.find((item) => itemHref(base, item.path) === location.pathname);
    if (!current && allowed[0]) {
      navigate(itemHref(base, allowed[0].path));
    }
  }, [hold, location.pathname, permissions, venue.id, base, navigate]);

  return (
    <SectionedNav
      heading={venue.name}
      sections={sections.map((section) => ({
        ...section,
        items: presentNavItems(section.items, base, venueIcons),
      }))}
      settings={settings ? presentNavItems([settings], base, venueIcons)[0] : null}
      isCollapsed={isCollapsed}
      collapsedMode="always-open"
      isActive={(href) => location.pathname === href}
      onNavigate={onNavItemClick}
    />
  );
}
