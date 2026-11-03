import { VenueAmenity } from "@/types/venue-amenity";
import { VenueAmenityForm } from "./venue-amenity-form";
import { VenueAmenityList } from "./venue-amenity-list";
import { useVenueAmenityStore } from "@/store/venueAmenityStore";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";
import { ServiceListSkeleton } from "@/components/service/service-list-skeleton";

interface VenueAmenitySectionProps {
    amenities: VenueAmenity[];
    venueId: string;
    isLoading: boolean;
    isCreating: boolean;
    selectedAmenity: VenueAmenity | null | undefined;
    setSelectedAmenity: (amenity: VenueAmenity | null | undefined) => void;
    onCreateClick: () => void;
    onCancelCreate: () => void;
}

export function VenueAmenitySection({
    amenities,
    venueId,
    isLoading,
    isCreating,
    selectedAmenity,
    setSelectedAmenity,
    onCreateClick,
    onCancelCreate,
}: VenueAmenitySectionProps) {
    const { createAmenity, updateAmenity } = useVenueAmenityStore();
    const { toast } = useToast();

    const handleSubmit = async (data: { name: string; position?: number }) => {
        try {
            const response = selectedAmenity
                ? await updateAmenity({
                    amenityId: selectedAmenity.id,
                    name: data.name,
                    position: data.position,
                })
                : await createAmenity({
                    venueId,
                    name: data.name,
                });
            const { title, message } = handleBackendSuccess(
                response,
                selectedAmenity ? "Característica atualizada com sucesso!" : "Característica cadastrada com sucesso!",
            );
            showSuccessToast({ title, description: message });
            setSelectedAmenity(undefined);
            onCancelCreate();
        } catch (error: unknown) {
            const { title, message } = handleBackendError(error, "Erro ao salvar característica. Tente novamente mais tarde.");
            toast({ title, description: message, variant: "destructive" });
        }
    };

    const showForm = isCreating || !!selectedAmenity;

    return (
        <div className="animate-fade-in">
            {isLoading ? (
                <ServiceListSkeleton />
            ) : (
                <AnimatedFormSwitcher
                    showForm={showForm}
                    list={
                        <VenueAmenityList
                            amenities={amenities || []}
                            onCreateClick={onCreateClick}
                            onEditClick={setSelectedAmenity}
                        />
                    }
                    form={
                        <VenueAmenityForm
                            amenity={selectedAmenity}
                            onSubmit={handleSubmit}
                            onCancel={() => {
                                setSelectedAmenity(undefined);
                                onCancelCreate();
                            }}
                        />
                    }
                />
            )}
        </div>
    );
}
