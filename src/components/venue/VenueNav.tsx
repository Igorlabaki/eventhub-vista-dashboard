import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Target,
  Contact,
  Bell,
  Globe,
  ClipboardList,
  MapPin,
  Calendar,
  BarChart,
  CalendarDays,
  Settings,
  KeyRound,
  Wrench,
  Receipt,
} from "lucide-react";
import { Venue } from "@/types";

interface VenueNavProps {
  isCollapsed: boolean;
  onNavItemClick: () => void;
  venue: Venue;
}

export function VenueNav({
  isCollapsed,
  onNavItemClick,
  venue,
}: VenueNavProps) {
  const location = useLocation();

  const venueNavItems = [
    {
      title: "Visão Geral",
      href: `/venue/${venue?.id}`,
      icon: LayoutDashboard,
    },
    {
      title: "Metas/Preços",
      href: `/venue/${venue?.id}/goals`,
      icon: Target,
    },
    {
      title: "Contatos",
      href: `/venue/${venue?.id}/contacts`,
      icon: Contact,
    },
    {
      title: "Notificações",
      href: `/venue/${venue?.id}/notifications`,
      icon: Bell,
    },
    {
      title: "Site",
      href: `/venue/${venue?.id}/website`,
      icon: Globe,
    },
    {
      title: "Orçamentos",
      href: `/venue/${venue?.id}/budgets`,
      icon: ClipboardList,
    },
    {
      title: "Despesas",
      href: `/venue/${venue?.id}/expenses`,
      icon: Receipt,
    },
    {
      title: "Serviços",
      href: `/venue/${venue?.id}/services`,
      icon: Wrench,
    },
    {
      title: "Eventos",
      href: `/venue/${venue?.id}/events`,
      icon: Calendar,
    },
    {
      title: "Relatórios",
      href: `/venue/${venue?.id}/reports`,
      icon: BarChart,
    },
    {
      title: "Agenda",
      href: `/venue/${venue?.id}/schedule`,
      icon: CalendarDays,
    },
    {
      title: "Configurações",
      href: `/venue/${venue?.id}/settings`,
      icon: Settings,
    },
  ];

  return (
    <div className="pt-3 pb-1">
      {!isCollapsed && (
        <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
           { venue?.name}
          </div>
      )}

      {venueNavItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={cn(
            "flex items-center px-3 py-2 mt-1 text-sm font-medium rounded-md hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary",
            location.pathname === item.href
              ? "bg-eventhub-tertiary/30 text-eventhub-primary"
              : "text-gray-700"
          )}
          onClick={onNavItemClick}
        >
          <item.icon className="h-5 w-5 mr-2" />
          {!isCollapsed && <span>{item.title}</span>}
        </Link>
      ))}
    </div>
  );
} 