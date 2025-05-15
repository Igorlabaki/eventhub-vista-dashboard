import { useState } from "react";
import { Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Owner } from "@/types/owner";
import { useGetOrganizationOwnersList } from "@/hooks/owner/queries/list";
import { useGetVenuesList } from "@/hooks/venue/queries/list";
import { OwnerForm } from "./OwnerForm";
import { VenueSelectionDialog } from "./VenueSelectionDialog";
import { OwnersList } from "./OwnersList";

interface OwnersManagerProps {
  organizationId: string;
  open: boolean;
  onClose: () => void;
  showInPage?: boolean;
}

export function OwnersManager({ organizationId, open, onClose, showInPage = false }: OwnersManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentOwner, setCurrentOwner] = useState<Owner | null>(null);
  const [venueEditDialogOpen, setVenueEditDialogOpen] = useState(false);
  const [currentVenues, setCurrentVenues] = useState<string[]>([]);

  const { data: ownersResponse } = useGetOrganizationOwnersList(organizationId);
  const { data: venues = [] } = useGetVenuesList(organizationId);
  
  const owners = ownersResponse || [];
  console.log(owners)
  const handleCreateClick = () => {
    setCurrentOwner(null);
    setIsEditing(true);
  };
  console.log("owners")
  const handleEdit = (owner: Owner) => {
    setCurrentOwner(owner);
    setIsEditing(true);
  };
  
  const handleEditVenues = (owner: Owner) => {
    setCurrentOwner(owner);
    setCurrentVenues(owner.ownerVenue?.map(ov => ov.venueId) || []);
    setVenueEditDialogOpen(true);
  };
  
  const resetForm = () => {
    setIsEditing(false);
    setCurrentOwner(null);
  };

  // If showInPage is true, render directly in the page instead of in a dialog
  if (showInPage) {
    return (
      <div className="p-6 ">
        {/* Owner List View */}
        {!isEditing && (
          <OwnersList
            owners={owners}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onCreateClick={handleCreateClick}
            onEditClick={handleEdit}
            onEditVenuesClick={handleEditVenues}
            organizationId={organizationId}
          />
        )}
        
        {/* Owner Form */}
        {isEditing && (
          <OwnerForm
            owner={currentOwner || undefined}
            organizationId={organizationId}
            onCancel={resetForm}
            isEditing={!!currentOwner}
          />
        )}
        
        {/* Venue Selection Dialog */}
        <VenueSelectionDialog
          open={venueEditDialogOpen}
          onOpenChange={setVenueEditDialogOpen}
          venues={venues}
          selectedVenues={currentVenues}
          ownerId={currentOwner?.id}
          organizationId={organizationId}
        />
      </div>
    );
  }
  
  if (!open) return null;

  // Standard dialog view (for modal)
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciar Proprietários
          </DialogTitle>
        </DialogHeader>
        
        {/* Owner List View */}
        {!isEditing && (
          <OwnersList
            owners={owners}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onCreateClick={handleCreateClick}
            onEditClick={handleEdit}
            onEditVenuesClick={handleEditVenues}
            organizationId={organizationId}
          />
        )}
        
        {/* Owner Form */}
        {isEditing && (
          <OwnerForm
            owner={currentOwner || undefined}
            organizationId={organizationId}
            onCancel={resetForm}
            isEditing={!!currentOwner}
          />
        )}
        
        {/* Venue Selection Dialog */}
        <VenueSelectionDialog
          open={venueEditDialogOpen}
          onOpenChange={setVenueEditDialogOpen}
          venues={venues}
          selectedVenues={currentVenues}
          ownerId={currentOwner?.id}
          organizationId={organizationId}
        />
      </DialogContent>
    </Dialog>
  );
} 