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
} from "lucide-react";

interface VenueNavProps {
  isCollapsed: boolean;
  onNavItemClick: () => void;
}

export function VenueNav({
  isCollapsed,
  onNavItemClick,
}: VenueNavProps) {
  const location = useLocation();

  const venueNavItems = [
    {
      title: "Visão Geral",
      href: "/venue",
      icon: LayoutDashboard,
    },
    {
      title: "Proprietários",
      href: "/venue/owners",
      icon: Users,
    },
    {
      title: "Metas/Preços",
      href: "/venue/goals",
      icon: Target,
    },
    {
      title: "Contatos",
      href: "/venue/contacts",
      icon: Contact,
    },
    {
      title: "Notificações",
      href: "/venue/notifications",
      icon: Bell,
    },
    {
      title: "Site",
      href: "/venue/website",
      icon: Globe,
    },
    {
      title: "Orçamentos",
      href: "/venue/budgets",
      icon: ClipboardList,
    },
    {
      title: "Visitas",
      href: "/venue/visits",
      icon: MapPin,
    },
    {
      title: "Eventos",
      href: "/venue/events",
      icon: Calendar,
    },
    {
      title: "Relatórios",
      href: "/venue/reports",
      icon: BarChart,
    },
    {
      title: "Agenda",
      href: "/venue/schedule",
      icon: CalendarDays,
    },
    {
      title: "Configurações",
      href: "/venue/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="pt-3 pb-1">
      {!isCollapsed && (
        <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Espaço atual
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