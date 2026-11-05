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
    const [createSession, setCreateSession] = useState(0);
    const [selectedAmenity, setSelectedAmenity] = useState<VenueAmenity | null | undefined>(undefined);
    const { amenities, isLoading, error, fetchAmenities } = useVenueAmenityStore();
    const { currentUserVenuePermission } = useUserVenuePermissionStore();

    useEffect(() => {
        if (venue?.id) {
            fetchAmenities(venue.id);
        }
    }, [venue?.id, fetchAmenities]);

    const canEdit = currentUserVenuePermission?.permissions?.includes("EDIT_VENUE_AMENITIES") ?? false;

    const openCreate = () => {
        setSelectedAmenity(undefined);
        setCreateSession((session) => session + 1);
        setIsCreating(true);
    };

    return (
        <DashboardLayout title="Características" subtitle="Cadastre o que este espaço tem">
            {canEdit && (
                <PageHeader
                    onCreateClick={openCreate}
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
                createSession={createSession}
                selectedAmenity={selectedAmenity}
                setSelectedAmenity={setSelectedAmenity}
                onCreateClick={openCreate}
                onCancelCreate={() => setIsCreating(false)}
            />
        </DashboardLayout>
    );
}
