import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Building, Calendar, ChevronRight, Menu, House } from "lucide-react";
import { OrganizationNav } from "@/components/organization/OrganizationNav";
import { VenueNav } from "@/components/venue/VenueNav";
import { WebsiteNav } from "@/components/website/WebsiteNav";
import { OrganizationWebsiteNav } from "@/components/website/OrganizationWebsiteNav";
import { useOrganizationStore } from "@/store/organizationStore";
import { useVenueStore } from "@/store/venueStore";
import { useUserStore } from "@/store/userStore";
import { useProposalStore } from "@/store/proposalStore";
import ProposalNav from "@/components/ProposalNav";
import { sidebarLevel } from "@/components/sidebar/sidebar-level";

export function SidebarNav({
  showOnMobile = false,
  onClose,
}: {
  showOnMobile?: boolean;
  onClose?: () => void;
}) {
  const location = useLocation();
  const params = useParams();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { currentOrganization, fetchOrganizationById } = useOrganizationStore();

  // Determine if we're in a venue section
  const isInVenue = location.pathname.startsWith("/venue");

  // Determine if we're in an organization section
  const isInOrg = location.pathname.includes("/organization/");

  // Determine if we're in a website section
  const isInWebsite = location.pathname.includes("/website");

  // Determine if we're in an organization website section
  const isInOrgWebsite = isInOrg && isInWebsite;

  const venueId = params.id; // venueId vem de /venue/:id/...
  const organizationId = params.id; // organizationId vem de /organization/:id/...

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNavItemClick = () => {
    if (showOnMobile && onClose) {
      onClose();
    }
  };

  // Controla o scroll da página quando o sidebar está aberto no mobile
  useEffect(() => {
    if (showOnMobile) {
      // Trava o scroll do body
      document.body.style.overflow = 'hidden';
    } else {
      // Restaura o scroll do body
      document.body.style.overflow = 'unset';
    }

    // Cleanup function para restaurar o scroll quando o componente for desmontado
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showOnMobile]);

  const user = useUserStore((state) => state.user);
  const { selectedVenue, fetchVenueById } = useVenueStore();
  useEffect(() => {
    if (venueId && user?.id && isInVenue) {
      fetchVenueById(venueId, user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId, user?.id, isInVenue]);

  const isInProposal = location.pathname.includes("/proposal/");
  const { currentProposal, fetchProposalById } = useProposalStore();
  const level = sidebarLevel({
    pathname: location.pathname,
    selectedVenueId: selectedVenue?.id ?? null,
    currentProposalId: currentProposal?.id ?? null,
    currentOrganizationId: currentOrganization?.id ?? null,
  });
  const sectionedNav = level.kind === "organization" || level.kind === "venue" || level.kind === "proposal";
  const proposalId = params.id; // pode ser id de proposal ou venue, depende da rota

  useEffect(() => {
    if (proposalId && isInProposal) {
      fetchProposalById(proposalId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalId, isInProposal]);

  useEffect(() => {
    if (organizationId && isInOrg) {
      fetchOrganizationById(organizationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, isInOrg]);

  return (
    <div
      className={cn(
        "flex flex-col h-screen border-r bg-white transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        showOnMobile ? "block" : "hidden md:flex",
        showOnMobile && "animate-slide-in-right md:animate-none",
        !showOnMobile && "animate-slide-out-right md:animate-none"
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center">
          <Calendar className="h-8 w-8 text-eventhub-primary" />
          {!isCollapsed && (
            <span className="ml-2 font-bold text-2xl text-eventhub-primary">
              EventHub
            </span>
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

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-4">
        <div className="shrink-0 space-y-1 px-2">
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
            <Building className="h-5 w-5 mr-2" />
            {!isCollapsed && <span>Organizações</span>}
          </Link>

          {isInOrgWebsite && currentOrganization && (
            <Link
              to={`/organization/${currentOrganization.id}/venues`}
              className={cn(
                "ml-3 mt-4 flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary"
              )}
              onClick={handleNavItemClick}
            >
              <Building className="h-5 w-5 mr-2" />
              {!isCollapsed && <span>{currentOrganization.name}</span>}
            </Link>
          )}

          {isInVenue && selectedVenue && currentOrganization && (
            <Link
              to={`/organization/${currentOrganization.id}/venues`}
              className="ml-3 mt-4 flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary"
              onClick={handleNavItemClick}
            >
              <Building className="h-5 w-5 mr-2" />
              {!isCollapsed && <span>{currentOrganization.name}</span>}
            </Link>
          )}

          {selectedVenue && isInProposal ? (
            <Link
              to={`/venue/${selectedVenue.id}`}
              className="ml-3 mt-4 flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary"
              onClick={handleNavItemClick}
            >
              <House className="h-5 w-5 mr-2" />
              {!isCollapsed && <span>{selectedVenue.name}</span>}
            </Link>
          ) : null}

          {isInWebsite && selectedVenue && !isInOrgWebsite ? (
            <Link
              to={`/venue/${selectedVenue.id}/notifications`}
              className="ml-3 mt-4 flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary"
              onClick={handleNavItemClick}
            >
              <House className="h-5 w-5 mr-2" />
              {!isCollapsed && <span>{selectedVenue.name}</span>}
            </Link>
          ) : null}
        </div>

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col px-2",
            !sectionedNav && "scrollbar-eventhub overflow-y-auto overflow-x-hidden",
            !sectionedNav && !isCollapsed && "[scrollbar-gutter:stable]"
          )}
        >
          {level.kind === "organization" && (
            <OrganizationNav
              organizationName={currentOrganization?.name || ""}
              organizationId={currentOrganization?.id}
              isCollapsed={isCollapsed}
              onNavItemClick={handleNavItemClick}
            />
          )}

          {level.kind === "venue" && selectedVenue && (
            <VenueNav
              hold={level.hold}
              isCollapsed={isCollapsed}
              onNavItemClick={handleNavItemClick}
              venue={selectedVenue}
            />
          )}

          {level.kind === "website" && selectedVenue && (
            <WebsiteNav
              isCollapsed={isCollapsed}
              onNavItemClick={handleNavItemClick}
              venueId={selectedVenue.id}
            />
          )}

          {level.kind === "org-website" && (currentOrganization?.id || organizationId) && (
            <OrganizationWebsiteNav
              isCollapsed={isCollapsed}
              onNavItemClick={handleNavItemClick}
              organizationId={currentOrganization?.id || organizationId || ""}
            />
          )}

          {level.kind === "proposal" && currentProposal && (
            <ProposalNav
              hold={level.hold}
              isCollapsed={isCollapsed}
              onNavItemClick={handleNavItemClick}
              proposal={currentProposal}
            />
          )}
        </div>
      </div>
    </div>
  );
}
