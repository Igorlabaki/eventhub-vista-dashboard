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
  Link2,
  Presentation,
  Settings,
  Sparkles,
  Images,
  Target,
  Wrench,
} from "lucide-react";
import { Venue } from "@/types";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import { Permissions } from "@/types/permissions";
import { SectionedNav } from "@/components/sidebar/SectionedNav";
import {
  venueUnreadNotificationsQuery,
  withNotificationBadge,
} from "@/components/sidebar/notification-nav-badge";
import { useGetNotificationsList } from "@/hooks/notification/queries/list";
import { publicVenuePresentationShareUrl } from "@/lib/public-venue-presentation";
import { useVenueShareHost } from "@/lib/use-venue-share-host";
import {
  flatNavItems,
  internalItemHref,
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
  Fotos: Images,
  Apresentação: Presentation,
  "Link tree": Link2,
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
  const shareHost = useVenueShareHost(venue.name);

  const canSee = (permission?: Permissions) => {
    if (!permission || !permissions) return false;
    return permissions.includes(permission);
  };
  const unreadQuery = useGetNotificationsList(
    venue.id,
    venueUnreadNotificationsQuery,
    canSee(Permissions.VIEW_VENUE_NOTIFICATIONS),
  );
  const unread = unreadQuery.data?.data.summary?.unread ?? 0;

  const sections = visibleSections(venueSections, canSee);
  const settings = canSee(venueSettingsItem.permission) ? venueSettingsItem : null;

  useEffect(() => {
    if (hold || !venue.id || !permissions) return;

    const allowed = flatNavItems(visibleSections(venueSections, (permission) => {
      if (!permission) return false;
      return permissions.includes(permission);
    }), permissions.includes(Permissions.VIEW_VENUE_CONFIG) ? venueSettingsItem : null);

    const current = allowed.find((item) => internalItemHref(base, item) === location.pathname);
    if (!current) {
      const next = allowed
        .map((item) => internalItemHref(base, item))
        .find((href): href is string => typeof href === "string");
      if (next) navigate(next);
    }
  }, [hold, location.pathname, permissions, venue.id, base, navigate]);

  return (
    <SectionedNav
      heading={venue.name}
      sections={sections.map((section) => ({
        ...section,
        items: withNotificationBadge(
          presentNavItems(section.items, base, venueIcons, (item) =>
            item.opensExternalUrl && item.title === "Apresentação"
              ? publicVenuePresentationShareUrl(venue.name, shareHost)
              : null,
          ),
          unread,
        ),
      }))}
      settings={settings ? presentNavItems([settings], base, venueIcons)[0] : null}
      isCollapsed={isCollapsed}
      collapsedMode="always-open"
      isActive={(href) => location.pathname === href}
      onNavigate={onNavItemClick}
    />
  );
}
