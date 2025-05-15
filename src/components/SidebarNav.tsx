import { useState } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Building, ChevronRight, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGetOrganizationById } from "@/hooks/organization/queries/getById";
import { useUpdateOrganizationMutations } from "@/hooks/organization/mutations/update";
import { useDeleteOrganizationMutations } from "@/hooks/organization/mutations/delete";
import { EditOrganizationForm } from "@/components/organization/EditOrganizationForm";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { OrganizationNav } from "@/components/organization/OrganizationNav";
import { VenueNav } from "@/components/venue/VenueNav";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  
  const { data: organization } = useGetOrganizationById(params.id || "");
  const { updateOrganization } = useUpdateOrganizationMutations(params.id || "");
  const { deleteOrganization } = useDeleteOrganizationMutations(params.id || "");
  
  // Determine if we're in a venue section
  const isInVenue = location.pathname.startsWith('/venue');
  
  // Determine if we're in an organization section
  const isInOrg = location.pathname.includes('/organization/');

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
  
  const handleConfirmDelete = () => {
    deleteOrganization.mutate(undefined, {
      onSuccess: () => {
    toast({
      title: "Sucesso",
      description: "Organização excluída com sucesso."
    });
    setDeleteDialogOpen(false);
    navigate('/dashboard');
      }
    });
  };
  
  const handleEditOrganization = () => {
    setEditDialogOpen(true);
  };
  
  const handleUpdateOrganization = (values: { name: string }) => {
    updateOrganization.mutate(
      { organizationId: params.id || "", data: { name: values.name } },
      {
        onSuccess: () => {
    toast({
      title: "Sucesso",
      description: "Nome da organização atualizado com sucesso!"
    });
    setEditDialogOpen(false);
        }
      }
    );
  };

  return (
    <>
      <div
        className={cn(
          "flex flex-col h-full border-r bg-white transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          showOnMobile ? "block" : "hidden md:flex"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <div className="flex items-center">
            <Building className="h-6 w-6 text-eventhub-primary" />
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
              <Building className="h-5 w-5 mr-2" />
              {!isCollapsed && <span>Organizações</span>}
            </Link>

            {isInOrg && !isCollapsed && (
              <OrganizationNav
                organizationName={organization?.name || ""}
                isCollapsed={isCollapsed}
                onEditClick={handleEditOrganization}
                onDeleteClick={handleDeleteOrganization}
                onNavItemClick={handleNavItemClick}
              />
            )}

            {isInVenue && (
              <VenueNav
                isCollapsed={isCollapsed}
                onNavItemClick={handleNavItemClick}
              />
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
            initialName={organization?.name || ""}
            onSubmit={handleUpdateOrganization}
            onCancel={() => setEditDialogOpen(false)}
            isPending={updateOrganization.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Organization Dialog */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        entityName={organization?.name || ""}
        entityType="organização"
        isPending={deleteOrganization.isPending}
      />
    </>
  );
}
