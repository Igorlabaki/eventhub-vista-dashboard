import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { VenueAmenitySection } from "@/components/venue-amenity/venue-amenity-section";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import { useVenueAmenityStore } from "@/store/venueAmenityStore";
import { useVenueStore } from "@/store/venueStore";
import { VenueAmenity } from "@/types/venue-amenity";

export default function VenueAmenities() {
    const { selectedVenue: venue } = useVenueStore();
    const [isCreating, setIsCreating] = useState(false);
    const [selectedAmenity, setSelectedAmenity] = useState<VenueAmenity | null | undefined>(undefined);
    const { amenities, isLoading, error, fetchAmenities } = useVenueAmenityStore();
    const { currentUserVenuePermission } = useUserVenuePermissionStore();

    useEffect(() => {
        if (venue?.id) {
            fetchAmenities(venue.id);
        }
    }, [venue?.id, fetchAmenities]);

    const canEdit = currentUserVenuePermission?.permissions?.includes("EDIT_VENUE_AMENITIES") ?? false;

    return (
        <DashboardLayout title="Características" subtitle="Cadastre o que este espaço tem">
            {canEdit && (
                <PageHeader
                    onCreateClick={() => setIsCreating(true)}
                    isFormOpen={isCreating || !!selectedAmenity}
                    createButtonText="Nova característica"
                />
            )}
            {error && !isLoading && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <p>{error}</p>
                    <button
                        type="button"
                        className="mt-2 underline"
                        onClick={() => venue?.id && fetchAmenities(venue.id)}
                    >
                        Tentar de novo
                    </button>
                </div>
            )}
            <VenueAmenitySection
                amenities={amenities}
                venueId={venue?.id ?? ""}
                isLoading={isLoading}
                isCreating={isCreating}
                selectedAmenity={selectedAmenity}
                setSelectedAmenity={setSelectedAmenity}
                onCreateClick={() => setIsCreating(true)}
                onCancelCreate={() => setIsCreating(false)}
            />
        </DashboardLayout>
    );
}
