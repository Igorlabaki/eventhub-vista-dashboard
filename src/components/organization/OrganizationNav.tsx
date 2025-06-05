import { Link, useLocation, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  KeyRound,
  FileText,
  Building,
  Settings,
} from "lucide-react";

interface OrganizationNavProps {
  organizationName: string;
  isCollapsed: boolean;
  onNavItemClick: () => void;
}

export function OrganizationNav({
  organizationName,
  isCollapsed,
  onNavItemClick,
}: OrganizationNavProps) {
  const location = useLocation();
  const params = useParams();
  const organizationId = params.id;

  const organizationActionItems = [
    {
      title: "Espaços",
      href: `/organization/${organizationId}/venues`,
      icon: Building,
    },
    {
      title: "Contratos",
      href: `/organization/${organizationId}/contracts`,
      icon: FileText,
    },
    {
      title: "Permissões",
      href: `/organization/${organizationId}/permissions`,
      icon: ShieldCheck,
    },
    {
      title: "Proprietários",
      href: `/organization/${organizationId}/owners`,
      icon: KeyRound,
    },
    {
      title: "Configurações",
      href: `/organization/${organizationId}/settings`,
      icon: Settings,
    },
  ];

  return (
    <div className="pb-1">
      <div className="px-3 mt-4 mb-2 text-sm font-semibold text-gray-500">
        {organizationName}
      </div>
      
      {organizationActionItems.map((item) => (
        <Link
          key={item.title}
          to={item.href}
          className={cn(
            "flex items-center px-3 py-2 mt-1 text-sm font-medium rounded-md hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary",
            location.pathname.includes(item.href)
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