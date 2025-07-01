import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/store/userStore";
import { useVenueStore } from "@/store/venueStore";
import { ItemListVenueResponse, Venue } from "@/types/venue";
import { DashboardLayout } from "@/components/DashboardLayout";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useOrganizationStore } from "@/store/organizationStore";
import { VenuesList } from "@/components/organization/venue-web/VenuesList";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";
import { EditVenueForm } from "@/components/organization/venue-web/EditVenueForm";
import { SelectVenueImagesForm } from "@/components/organization/venue-web/SelectVenueImagesForm";

export default function OrganizationWebsiteVenues() {
  const { currentOrganization: organization } = useOrganizationStore();
  const { venues, isLoading, fetchVenues } = useVenueStore();
  const { user } = useUserStore();

  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [selectVenue, setSelectVenue] =
    useState<ItemListVenueResponse | null>(null);
  const [editVenue, setEditVenue] = useState<ItemListVenueResponse | null>(null);
 
  useEffect(() => {
    if (organization?.id && user?.id) {
      fetchVenues({ organizationId: organization.id, userId: user.id });
    }
  }, [organization?.id, user?.id, fetchVenues]);

  const handleCreateClick = () => {
    setShowForm(true);
  };

  return (
    <DashboardLayout
      title="Espaços do Site"
      subtitle="Escolha e gerencie os espaços que aparecem no site da sua organização"
    >
      <AnimatedFormSwitcher
        showForm={showForm || !!selectVenue || !!editVenue}
        list={
          <VenuesList
            venues={venues}
            isLoading={isLoading}
            onCreateClick={handleCreateClick}
            onCardClick={() => setShowForm(true)}
            onSelectVenue={setSelectVenue}
            onEditVenue={setEditVenue}
          />
        }
        form={
          editVenue ? (
            <EditVenueForm
              venue={editVenue}
              onCancel={() => setEditVenue(null)}
            />
          ) : (
            <SelectVenueImagesForm
              setShowForm={setShowForm}
              setSelectVenue={setSelectVenue}
              venueId={selectVenue?.id}
              organizationId={organization?.id}
              images={selectVenue?.images}
              onCancel={() => { setShowForm(false); setSelectVenue(null); }}
            />
          )
        }
      />
    </DashboardLayout>
  );
}
