import { VenuePermissionsList } from "@/components/permissions/VenuePermissionsList";
import { ItemListVenueResponse } from "@/types/venue";
import { UserOrganization } from "@/types/userOrganization";
import React from "react";

interface VenuePermissionSectionProps {
  view: "venues";
  selectedUserOrganization: UserOrganization;
  venues: ItemListVenueResponse[];
  handleGoBack: () => void;
  handleVenueClick: (
    venue: ItemListVenueResponse,
    venuePermission: {
      id: string;
      permissions: string[];
      role: string;
    }
  ) => void;
}

export const VenuePermissionSection: React.FC<VenuePermissionSectionProps> = ({
  view,
  selectedUserOrganization,
  venues,
  handleGoBack,
  handleVenueClick,
}) => {
  return (
    <div className="bg-white rounded-md shadow-lg overflow-hidden">
      <div className="rounded-md overflow-hidden bg-gray-50 border-[1.5px] border-gray-200">
        <div className="bg-eventhub-primary text-white px-2  font-semibold py-2">
          <h2>Espaços</h2>
        </div>
        <VenuePermissionsList
          venues={venues}
          onVenueClick={handleVenueClick}
          userVenuePermissions={(
            selectedUserOrganization.userVenuePermissions || []
          ).reduce(
            (acc, perm) => {
              acc[perm.venueId] = {
                permissions: Array.isArray(perm.permissions)
                  ? perm.permissions
                  : (perm.permissions || "").split(","),
                role: perm.role,
                id: perm.id,
              };
              return acc;
            },
            {} as {
              [venueId: string]: {
                id: string;
                permissions: string[];
                role: string;
              };
            }
          )}
        />
      </div>
    </div>
  );
};
