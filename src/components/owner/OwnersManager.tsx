import { useState, useEffect } from "react";
import { OwnersList } from "./OwnersList";
import { OwnerForm } from "./OwnerForm";
import { VenueSelectionDialog } from "./VenueSelectionDialog";
import { cn } from "@/lib/utils";
import { useOwnerStore } from "@/store/ownerStore";
import { useVenueStore } from "@/store/venueStore";

interface OwnersManagerProps {
  organizationId: string;
}

export function OwnersManager({ organizationId }: OwnersManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentOwner, setCurrentOwner] = useState(null);
  const [venueEditDialogOpen, setVenueEditDialogOpen] = useState(false);
  const [currentVenues, setCurrentVenues] = useState<string[]>([]);

  // Zustand stores
  const { owners, fetchOrganizationOwners } = useOwnerStore();
  const { venues, fetchVenues } = useVenueStore();

  useEffect(() => {
    if (organizationId) {
      fetchOrganizationOwners(organizationId);
      fetchVenues(organizationId);
    }
  }, [organizationId, fetchOrganizationOwners, fetchVenues]);

  const handleCreateClick = () => {
    setCurrentOwner(null);
    setIsEditing(true);
  };

  const handleEdit = (owner) => {
    setCurrentOwner(owner);
    setIsEditing(true);
  };

  const handleEditVenues = (owner) => {
    setCurrentOwner(owner);
    setCurrentVenues(owner.ownerVenue?.map(ov => ov.venueId) || []);
    setVenueEditDialogOpen(true);
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentOwner(null);
  };

  return (
    <div className="p-6 relative">
      {/* Lista de Owners */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isEditing ? "opacity-0 scale-95 absolute w-full" : "opacity-100 scale-100"
      )}>
        <OwnersList
          owners={owners}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onCreateClick={handleCreateClick}
          onEditClick={handleEdit}
          onEditVenuesClick={handleEditVenues}
          organizationId={organizationId}
        />
      </div>

      {/* Formulário de Owner */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isEditing ? "opacity-100 scale-100 w-full" : "opacity-0 scale-95 absolute w-full"
      )}>
        <OwnerForm
          owner={currentOwner || undefined}
          organizationId={organizationId}
          onCancel={resetForm}
        />
      </div>

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