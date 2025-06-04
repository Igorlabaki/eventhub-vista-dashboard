import { useState, useEffect } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Building, Calendar, ChevronRight, Menu, House } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EditOrganizationForm } from "@/components/organization/EditOrganizationForm";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { OrganizationNav } from "@/components/organization/OrganizationNav";
import { VenueNav } from "@/components/venue/VenueNav";
import { WebsiteNav } from "@/components/website/WebsiteNav";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOrganizationStore } from "@/store/organizationStore";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";
import { showSuccessToast } from "@/components/ui/success-toast";
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // State for dialogs
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { currentOrganization, deleteOrganization, isLoading } =
    useOrganizationStore();

  // Determine if we're in a venue section
  const isInVenue = location.pathname.startsWith("/venue");

  // Determine if we're in an organization section
  const isInOrg = location.pathname.includes("/organization/");

  // Determine if we're in a website section
  const isInWebsite = location.pathname.includes("/website");

  const venueId = params.id; // venueId vem de /venue/:id/...

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNavItemClick = () => {
    if (showOnMobile && onClose) {
      onClose();
    }
  };

  const handleDeleteOrganization = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await deleteOrganization(params.id || "");
      const { title, message } = handleBackendSuccess(
        response,
        "Organização excluída com sucesso!"
      );
      showSuccessToast({
        title,
        description: message,
      });
      setDeleteDialogOpen(false);
      navigate("/dashboard");
    } catch (error: unknown) {
      const { title, message } = handleBackendError(
        error,
        "Erro ao excluir organização. Tente novamente mais tarde."
      );
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleEditOrganization = () => {
    setEditDialogOpen(true);
  };

  const user = useUserStore((state) => state.user);
  const { selectedVenue, fetchVenueById } = useVenueStore();
  useEffect(() => {
    if (venueId && user?.id && isInVenue) {
      fetchVenueById(venueId, user.id);
    }
  }, [venueId, user?.id, fetchVenueById]);

  const isInProposal = location.pathname.includes("/proposal/");
  const { currentProposal } = useProposalStore();

  return (
    <>
      <div
        className={cn(
          "flex flex-col h-screen border-r bg-white transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          showOnMobile ? "block" : "hidden md:flex"
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
            {(selectedVenue && isInProposal) ||
              (selectedVenue && isInWebsite && (
                <Link
                  to={`/venue/${selectedVenue.id}`}
                  className={cn(
                    "flex items-center ml-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary mt-4",
                    "text-gray-700"
                  )}
                  onClick={handleNavItemClick}
                >
                  <House className="h-5 w-5 mr-2" />
                  {!isCollapsed && <span>{selectedVenue.name}</span>}
                </Link>
              ))}
            {selectedVenue && isInProposal && (
              <Link
                to={`/venue/${selectedVenue.id}`}
                className={cn(
                  "flex items-center ml-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary mt-4",
                  "text-gray-700"
                )}
                onClick={handleNavItemClick}
              >
                <House className="h-5 w-5 mr-2" />
                {!isCollapsed && <span>{selectedVenue.name}</span>}
              </Link>
            )}

            {isInOrg && !isCollapsed && (
              <OrganizationNav
                organizationName={currentOrganization?.name || ""}
                isCollapsed={isCollapsed}
                onEditClick={handleEditOrganization}
                onDeleteClick={handleDeleteOrganization}
                onNavItemClick={handleNavItemClick}
              />
            )}

            {isInVenue && !isInWebsite && (
              <VenueNav
                isCollapsed={isCollapsed}
                onNavItemClick={handleNavItemClick}
                venue={selectedVenue}
              />
            )}

            {isInWebsite && selectedVenue && (
              <WebsiteNav
                isCollapsed={isCollapsed}
                onNavItemClick={handleNavItemClick}
                venueId={selectedVenue.id}
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

      {/* Edit Organization Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="w-full max-w-full md:w-[50%] md:max-w-[50%] rounded-md z-[9999]">
          <DialogHeader>
            <DialogTitle>Editar Organização</DialogTitle>
          </DialogHeader>
          <EditOrganizationForm
            organizationId={params.id || ""}
            initialName={currentOrganization?.name || ""}
            onCancel={() => setEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Organization Dialog */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        entityName={currentOrganization?.name || ""}
        entityType="organização"
        isPending={isLoading}
      />
    </>
  );
}
