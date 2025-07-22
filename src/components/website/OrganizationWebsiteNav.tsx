import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ExternalLink, Layout, FileText, Image, HelpCircle, LayoutDashboard } from "lucide-react";
import { useOrganizationStore } from "@/store/organizationStore";

interface OrganizationWebsiteNavProps {
  isCollapsed: boolean;
  onNavItemClick?: () => void;
  organizationId: string;
}

export function OrganizationWebsiteNav({ isCollapsed, onNavItemClick, organizationId }: OrganizationWebsiteNavProps) {
  const location = useLocation();
  const { currentOrganization } = useOrganizationStore();

  return (
    <div className="space-y-1">
      <Link
        to={`/organization/${organizationId}/website`}
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary",
          location.pathname === `/organization/${organizationId}/website`
            ? "bg-eventhub-tertiary/30 text-eventhub-primary"
            : "text-gray-700"
        )}
        onClick={onNavItemClick}
      >
        <LayoutDashboard className="h-5 w-5 mr-2" />
        {!isCollapsed && <span>Visão Geral</span>}
      </Link>

      <Link
        to={`/organization/${organizationId}/website/texts`}
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary",
          location.pathname === `/organization/${organizationId}/website/texts`
            ? "bg-eventhub-tertiary/30 text-eventhub-primary"
            : "text-gray-700"
        )}
        onClick={onNavItemClick}
      >
        <FileText className="h-5 w-5 mr-2" />
        {!isCollapsed && <span>Textos</span>}
      </Link>

      <Link
        to={`/organization/${organizationId}/website/venues`}
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary",
          location.pathname === `/organization/${organizationId}/website/venues`
            ? "bg-eventhub-tertiary/30 text-eventhub-primary"
            : "text-gray-700"
        )}
        onClick={onNavItemClick}
      >
        <Layout className="h-5 w-5 mr-2" />
        {!isCollapsed && <span>Espaços</span>}
      </Link>

      <Link
        to={`/organization/${organizationId}/website/images`}
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary",
          location.pathname === `/organization/${organizationId}/website/images`
            ? "bg-eventhub-tertiary/30 text-eventhub-primary"
            : "text-gray-700"
        )}
        onClick={onNavItemClick}
      >
        <Image className="h-5 w-5 mr-2" />
        {!isCollapsed && <span>Imagens</span>}
      </Link>

 {/*      <Link
        to={`/organization/${organizationId}/website/faq`}
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary",
          location.pathname === `/organization/${organizationId}/website/faq`
            ? "bg-eventhub-tertiary/30 text-eventhub-primary"
            : "text-gray-700"
        )}
        onClick={onNavItemClick}
      >
        <HelpCircle className="h-5 w-5 mr-2" />
        {!isCollapsed && <span>FAQ</span>}
      </Link>
 */}
      <a
        href={currentOrganization.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary",
          "text-gray-700"
        )}
        onClick={onNavItemClick}
      >
        <ExternalLink className="h-5 w-5 mr-2" />
        {!isCollapsed && <span>Ver Site</span>}
      </a>
    </div>
  );
} 