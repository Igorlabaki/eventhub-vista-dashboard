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
      <div className="flex items-center justify-between h-16 px-4 border-b">
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
            <Building className="h-5 w-5 mr-2" />
            {!isCollapsed && <span>Organizações</span>}
          </Link>

          {isInOrgWebsite && currentOrganization   &&(
            <Link
              to={`/organization/${currentOrganization.id}/venues`}
              className={cn(
                "flex items-center ml-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary mt-4",
                "text-gray-700"
              )}
              onClick={handleNavItemClick}
            >
              <Building className="h-5 w-5 mr-2" />
              {!isCollapsed && <span>{currentOrganization.name}</span>}
            </Link>
          )}


          { isInVenue && selectedVenue   &&(
            <Link
              to={`/organization/${currentOrganization.id}/venues`}
              className={cn(
                "flex items-center ml-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary mt-4",
                "text-gray-700"
              )}
              onClick={handleNavItemClick}
            >
              <Building className="h-5 w-5 mr-2" />
              {!isCollapsed && <span>{currentOrganization.name}</span>}
            </Link>
          )}

          {selectedVenue && isInProposal || isInWebsite && selectedVenue && !isInOrgWebsite ? (
            <Link
              to={`/venue/${selectedVenue.id}/notifications`}
              className={cn(
                "flex items-center ml-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary mt-4",
                "text-gray-700"
              )}
              onClick={handleNavItemClick}
            >
              <House className="h-5 w-5 mr-2" />
              {!isCollapsed && <span>{selectedVenue.name}</span>}
            </Link>
          ): null}

          {isInOrg && !isCollapsed && !isInOrgWebsite && (
            <OrganizationNav
              organizationName={currentOrganization?.name || ""}
              isCollapsed={isCollapsed}
              onNavItemClick={handleNavItemClick}
            />
          )}

          {isInVenue && !isInWebsite && selectedVenue && (
            <VenueNav
              isCollapsed={isCollapsed}
              onNavItemClick={handleNavItemClick}
              venue={selectedVenue}
            />
          )}

          {isInWebsite && selectedVenue && !isInOrgWebsite && (
            <WebsiteNav
              isCollapsed={isCollapsed}
              onNavItemClick={handleNavItemClick}
              venueId={selectedVenue.id}
            />
          )}

          {isInOrgWebsite && organizationId && (
            <OrganizationWebsiteNav
              isCollapsed={isCollapsed}
              onNavItemClick={handleNavItemClick}
              organizationId={organizationId}
            />
          )}

          {isInProposal && (
            <>
              <ProposalNav
                isCollapsed={isCollapsed}
                onNavItemClick={handleNavItemClick}
                proposal={currentProposal}
              />
            </>
          )}
        </nav>
      </div>
    </div>
  );
}
