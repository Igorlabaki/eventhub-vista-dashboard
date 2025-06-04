import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ExternalLink, Layout, FileText, Image, HelpCircle, LayoutDashboard } from "lucide-react";

interface WebsiteNavProps {
  isCollapsed: boolean;
  onNavItemClick?: () => void;
  venueId: string;
}

export function WebsiteNav({ isCollapsed, onNavItemClick, venueId }: WebsiteNavProps) {
  return (
    <div className="space-y-1">
      <Link
        to={`/venue/${venueId}/website`}
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary",
          "text-gray-700"
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
          "text-gray-700"
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
          "text-gray-700"
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
          "text-gray-700"
        )}
        onClick={onNavItemClick}
      >
        <HelpCircle className="h-5 w-5 mr-2" />
        {!isCollapsed && <span>FAQ</span>}
      </Link>

      <a
        href={`https://eventhub.com.br/venue/${venueId}`}
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