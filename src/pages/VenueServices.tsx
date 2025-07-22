import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ServiceSection } from "@/components/service/service-section";
import { useServiceStore } from "@/store/serviceStore";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { Plus } from "lucide-react";
import { useVenueStore } from "@/store/venueStore";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import { PageHeader } from "@/components/PageHeader";
import AccessDenied from "@/components/accessDenied";

export default function VenueServices() {
  const { selectedVenue: venue } = useVenueStore();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const { services, isLoading, fetchServices } = useServiceStore();

  useEffect(() => {
    if (venue.id) {
      fetchServices(venue.id);
    }
  }, [venue.id, fetchServices]);

  const { currentUserVenuePermission } = useUserVenuePermissionStore();

  const hasEditPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes(
      "EDIT_VENUE_SERVICES"
    );
  };

  return (
    <DashboardLayout title="Serviços" subtitle="Gerencie os serviços do seu espaço">
      {hasEditPermission() && (
      <PageHeader
        onCreateClick={() => setIsCreating(true)}
        isFormOpen={isCreating}
          createButtonText="Novo Serviço"
        />
      )}
      <ServiceSection
        services={services}
        venueId={venue.id}
        isLoading={isLoading}
        isCreating={isCreating}
        selectedService={selectedService}
        setSelectedService={setSelectedService}
        onCreateClick={() => setIsCreating(true)}
        onCancelCreate={() => setIsCreating(false)}
      />
    </DashboardLayout>
  );
}
