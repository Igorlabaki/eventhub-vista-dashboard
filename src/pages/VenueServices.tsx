import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ServiceSection } from "@/components/service/service-section";
import { useServiceStore } from "@/store/serviceStore";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { Plus } from "lucide-react";
import { useVenueStore } from "@/store/venueStore";

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

  return (
    <DashboardLayout title="Serviços" subtitle="Gerencie os serviços do seu espaço">
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
            {/* Botão flutuante para mobile */}
            <div className="md:hidden">
        <button
          onClick={() => setIsCreating(true)}
          className={`bottom-6 right-6 bg-[#8854D0] ${isCreating ? 'hidden' : 'fixed'} text-white rounded-full shadow-lg w-14 h-14 flex items-center
           justify-center text-3xl hover:bg-[#6c3fc9] transition-colors`}
          aria-label="Novo Serviço"
        >
          <Plus className="h-7 w-7" />
        </button>
      </div>
    </DashboardLayout>
  );
}
