import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
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
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import { venueViewPermissions, Permissions } from "@/types/permissions";

interface VenueNavProps {
  isCollapsed: boolean;
  onNavItemClick: () => void;
  venue: Venue;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  permissionRequired: Permissions;
}

export function VenueNav({
  isCollapsed,
  onNavItemClick,
  venue,
}: VenueNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUserVenuePermission } = useUserVenuePermissionStore();

  // Mapeamento dos itens de navegação baseado no venueViewPermissions
  const venueNavItems: NavItem[] = [
    {
      title: "Notificações",
      href: `/venue/${venue?.id}/notifications`,
      icon: Bell,
      permissionRequired: Permissions.VIEW_VENUE_NOTIFICATIONS,
    },
    {
      title: "Visão Geral",
      href: `/venue/${venue?.id}`,
      icon: LayoutDashboard,
      permissionRequired: Permissions.VIEW_VENUE_INFO,
    },
    {
      title: "Metas/Preços",
      href: `/venue/${venue?.id}/goals`,
      icon: Target,
      permissionRequired: Permissions.VIEW_VENUE_PRICES,
    },
    {
      title: "Contatos",
      href: `/venue/${venue?.id}/contacts`,
      icon: Contact,
      permissionRequired: Permissions.VIEW_VENUE_CONTACTS,
    },
    {
      title: "Site",
      href: `/venue/${venue?.id}/website`,
      icon: Globe,
      permissionRequired: Permissions.VIEW_VENUE_SITES,
    },
    {
      title: "Orçamentos",
      href: `/venue/${venue?.id}/budgets`,
      icon: ClipboardList,
      permissionRequired: Permissions.VIEW_VENUE_PROPOSALS,
    },
    {
      title: "Despesas",
      href: `/venue/${venue?.id}/expenses`,
      icon: Receipt,
      permissionRequired: Permissions.VIEW_VENUE_EXPENSES,
    },
    {
      title: "Serviços",
      href: `/venue/${venue?.id}/services`,
      icon: Wrench,
      permissionRequired: Permissions.VIEW_VENUE_SERVICES,
    },
    {
      title: "Eventos",
      href: `/venue/${venue?.id}/events`,
      icon: Calendar,
      permissionRequired: Permissions.VIEW_VENUE_EVENTS,
    },
    {
      title: "Relatórios",
      href: `/venue/${venue?.id}/reports`,
      icon: BarChart,
      permissionRequired: Permissions.VIEW_VENUE_ANALYSIS,
    },
    {
      title: "Agenda",
      href: `/venue/${venue?.id}/schedule`,
      icon: CalendarDays,
      permissionRequired: Permissions.VIEW_VENUE_CALENDAR,
    },
    {
      title: "Configurações",
      href: `/venue/${venue?.id}/settings`,
      icon: Settings,
      permissionRequired: Permissions.VIEW_VENUE_PERMISSIONS,
    },
  ];

  // Função para verificar se o usuário tem a permissão necessária
  const hasPermission = (requiredPermission: Permissions) => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes(requiredPermission);
  };

  // Filtrar itens baseado nas permissões
  const filteredNavItems = venueNavItems.filter(item => 
    hasPermission(item.permissionRequired)
  );

  // Verificar se a página atual é acessível e redirecionar se necessário
  useEffect(() => {
    if (!venue?.id || !currentUserVenuePermission?.permissions) return;

    const currentPath = location.pathname;
    const currentItem = venueNavItems.find(item => item.href === currentPath);
    
    // Se a página atual não existe ou o usuário não tem permissão
    if (!currentItem || !hasPermission(currentItem.permissionRequired)) {
      // Encontrar a primeira página disponível
      const firstAvailableItem = venueNavItems.find(item => 
        hasPermission(item.permissionRequired)
      );
      
      // Redirecionar para a primeira página disponível
      if (firstAvailableItem) {
        navigate(firstAvailableItem.href);
      }
    }
  }, [location.pathname, currentUserVenuePermission?.permissions, venue?.id]);

  return (
    <div className="pt-3 pb-1">
      {!isCollapsed && (
        <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
           { venue?.name}
        </div>
      )}

      {filteredNavItems.map((item) => (
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