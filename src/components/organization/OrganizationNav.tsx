import { Link, useLocation, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  KeyRound,
  FileText,
  Building,
  Settings,
  Globe,
} from "lucide-react";
import { organizationViewPermissions, Permissions } from "@/types/permissions";
import { useUserOrganizationPermissionStore } from "@/store/userOrganizationPermissionStore";

interface OrganizationNavProps {
  organizationName: string;
  isCollapsed: boolean;
  onNavItemClick: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  permissionRequired: Permissions;
}

export function OrganizationNav({
  organizationName,
  isCollapsed,
  onNavItemClick,
}: OrganizationNavProps) {
  const location = useLocation();
  const params = useParams();
  const organizationId = params.id;
  const { currentUserOrganizationPermission } = useUserOrganizationPermissionStore();

  // Mapeamento dos itens de navegação baseado no organizationViewPermissions
  const organizationActionItems: NavItem[] = [
    {
      title: "Espaços",
      href: `/organization/${organizationId}/venues`,
      icon: Building,
      permissionRequired: Permissions.VIEW_ORG_VENUES,
    },
    {
      title: "Contratos",
      href: `/organization/${organizationId}/contracts`,
      icon: FileText,
      permissionRequired: Permissions.VIEW_ORG_CONTRACTS,
    },
    {
      title: "Permissões",
      href: `/organization/${organizationId}/permissions`,
      icon: ShieldCheck,
      permissionRequired: Permissions.VIEW_ORG_PERMISSIONS,
    },
    {
      title: "Proprietários",
      href: `/organization/${organizationId}/owners`,
      icon: KeyRound,
      permissionRequired: Permissions.VIEW_ORG_OWNERS,
    },
    {
      title: "Site",
      href: `/organization/${organizationId}/website`,
      icon: Globe,
      permissionRequired: Permissions.VIEW_ORG_SITE,
    },
    {
      title: "Configurações",
      href: `/organization/${organizationId}/settings`,
      icon: Settings,
      permissionRequired: Permissions.VIEW_ORG_INFO,
    },
  ];
  
  // Função para verificar se o usuário tem a permissão necessária
  const hasPermission = (requiredPermission: Permissions) => {
    if (!currentUserOrganizationPermission?.permissions) return false;
    return currentUserOrganizationPermission.permissions.includes(requiredPermission);
  };

  // Filtrar itens baseado nas permissões
  const filteredNavItems = organizationActionItems.filter(item => 
    hasPermission(item.permissionRequired)
  );

  return (
    <div className="pb-1">
      <div className="px-3 mt-4 mb-2 text-sm font-semibold text-gray-500">
        {organizationName}
      </div>
      
      {filteredNavItems.map((item) => (
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