
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Calendar,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Home,
  LayoutDashboard,
  Menu,
  Settings,
  Users,
  BarChart,
  Bell,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
};

const venueNavItems: NavItem[] = [
  {
    title: "Visão Geral",
    href: "/venue",
    icon: LayoutDashboard,
  },
  {
    title: "Orçamentos",
    href: "/venue/budgets",
    icon: ClipboardList,
  },
  {
    title: "Eventos",
    href: "/venue/events",
    icon: Calendar,
  },
  {
    title: "Visitas",
    href: "/venue/visits",
    icon: Users,
  },
  {
    title: "Contratos",
    href: "/venue/contracts",
    icon: FileText,
  },
  {
    title: "Pagamentos",
    href: "/venue/payments",
    icon: CreditCard,
  },
  {
    title: "Notificações",
    href: "/venue/notifications",
    icon: Bell,
  },
  {
    title: "Relatórios",
    href: "/venue/reports",
    icon: BarChart,
  },
  {
    title: "Configurações",
    href: "/venue/settings",
    icon: Settings,
  },
];

export function SidebarNav({
  showOnMobile = false,
  onClose,
}: {
  showOnMobile?: boolean;
  onClose?: () => void;
}) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNavItemClick = () => {
    if (showOnMobile && onClose) {
      onClose();
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full border-r bg-white transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        showOnMobile ? "block" : "hidden md:flex"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b">
        <div className="flex items-center">
          <Calendar className="h-6 w-6 text-eventhub-primary" />
          {!isCollapsed && (
            <span className="ml-2 font-bold text-eventhub-primary">EventHub</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="md:flex hidden"
          onClick={toggleSidebar}
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform",
              isCollapsed ? "" : "rotate-180"
            )}
          />
        </Button>
        {showOnMobile && onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Menu className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto py-4">
        <nav className="flex-1 px-2 space-y-1">
          <Link
            to="/dashboard"
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary",
              location.pathname === "/dashboard"
                ? "bg-eventhub-tertiary/30 text-eventhub-primary"
                : "text-gray-700"
            )}
            onClick={handleNavItemClick}
          >
            <Home className="h-5 w-5 mr-2" />
            {!isCollapsed && <span>Organizações</span>}
          </Link>

          <div className="pt-3 pb-1">
            {!isCollapsed && (
              <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Venue atual
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
                onClick={handleNavItemClick}
              >
                <item.icon className="h-5 w-5 mr-2" />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
