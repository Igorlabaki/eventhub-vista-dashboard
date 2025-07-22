import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ExternalLink, Layout, FileText, Image, HelpCircle, LayoutDashboard } from "lucide-react";
import { useVenueStore } from "@/store/venueStore";
interface WebsiteNavProps {
  isCollapsed: boolean;
  onNavItemClick?: () => void;
  venueId: string;
}

export function WebsiteNav({ isCollapsed, onNavItemClick, venueId }: WebsiteNavProps) {
  const { selectedVenue } = useVenueStore();
  const location = useLocation();

  return (
    <div className="space-y-1">
      <Link
        to={`/venue/${venueId}/website`}
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary",
          location.pathname === `/venue/${venueId}/website`
            ? "bg-eventhub-tertiary/30 text-eventhub-primary"
            : "text-gray-700"
        )}
        onClick={onNavItemClick}
      >
        <LayoutDashboard className="h-5 w-5 mr-2" />
        {!isCollapsed && <span>Visão Geral</span>}
      </Link>

      <Link
        to={`/venue/${venueId}/website/texts`}
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary",
          location.pathname === `/venue/${venueId}/website/texts`
            ? "bg-eventhub-tertiary/30 text-eventhub-primary"
            : "text-gray-700"
        )}
        onClick={onNavItemClick}
      >
        <FileText className="h-5 w-5 mr-2" />
        {!isCollapsed && <span>Textos</span>}
      </Link>

      <Link
        to={`/venue/${venueId}/website/images`}
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary",
          location.pathname === `/venue/${venueId}/website/images`
            ? "bg-eventhub-tertiary/30 text-eventhub-primary"
            : "text-gray-700"
        )}
        onClick={onNavItemClick}
      >
        <Image className="h-5 w-5 mr-2" />
        {!isCollapsed && <span>Imagens</span>}
      </Link>

      <Link
        to={`/venue/${venueId}/website/faq`}
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary",
          location.pathname === `/venue/${venueId}/website/faq`
            ? "bg-eventhub-tertiary/30 text-eventhub-primary"
            : "text-gray-700"
        )}
        onClick={onNavItemClick}
      >
        <HelpCircle className="h-5 w-5 mr-2" />
        {!isCollapsed && <span>FAQ</span>}
      </Link>

      <a
        href={`${selectedVenue.url}`}
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