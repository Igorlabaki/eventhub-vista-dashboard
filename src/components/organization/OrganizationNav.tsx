import type { ElementType } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Building, FileText, Globe, KeyRound, Settings, ShieldCheck } from "lucide-react";
import { Permissions } from "@/types/permissions";
import { useUserOrganizationPermissionStore } from "@/store/userOrganizationPermissionStore";
import { SectionedNav } from "@/components/sidebar/SectionedNav";
import {
  organizationSections,
  organizationSettingsItem,
  presentNavItems,
  visibleSections,
} from "@/components/sidebar/sidebar-nav-model";

interface OrganizationNavProps {
  organizationName: string;
  isCollapsed: boolean;
  onNavItemClick: () => void;
  organizationId?: string;
}

const organizationIcons: Record<string, ElementType> = {
  Espaços: Building,
  Contratos: FileText,
  Site: Globe,
  Permissões: ShieldCheck,
  Proprietários: KeyRound,
  Configurações: Settings,
};

export function OrganizationNav({
  organizationName,
  isCollapsed,
  onNavItemClick,
  organizationId: organizationIdProp,
}: OrganizationNavProps) {
  const location = useLocation();
  const params = useParams();
  const organizationId = organizationIdProp || params.id;
  const { currentUserOrganizationPermission } = useUserOrganizationPermissionStore();
  const permissions = currentUserOrganizationPermission?.permissions;
  const base = `/organization/${organizationId}`;

  const canSee = (permission?: Permissions) => {
    if (!permission || !permissions) return false;
    return permissions.includes(permission);
  };

  const sections = visibleSections(organizationSections, canSee);
  const settings = canSee(organizationSettingsItem.permission) ? organizationSettingsItem : null;

  return (
    <SectionedNav
      heading={organizationName || undefined}
      sections={sections.map((section) => ({
        ...section,
        items: presentNavItems(section.items, base, organizationIcons),
      }))}
      settings={settings ? presentNavItems([settings], base, organizationIcons)[0] : null}
      isCollapsed={isCollapsed}
      collapsedMode="all"
      isActive={(href) => location.pathname.includes(href)}
      onNavigate={onNavItemClick}
    />
  );
}
