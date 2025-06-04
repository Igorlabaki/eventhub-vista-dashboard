import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";

import { useImageStore } from "@/store/imageStore";
import { useVenueStore } from "@/store/venueStore";
import { Image } from "@/types/image";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ImageSection } from "@/components/image/image-section";

export default function VenueWebsiteImages() {
  const { selectedVenue: venue } = useVenueStore();
  const { images, isLoading, fetchImages } = useImageStore();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image | null | undefined>(undefined);

  const handleCreateClick = () => {
    setIsCreating(true);
    setSelectedImage(null);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setSelectedImage(null);
  };

  useEffect(() => {
    if (venue.id) {
      fetchImages({ venueId: venue.id });
    }
  }, [venue.id, fetchImages]);

  return (
    <DashboardLayout title="Imagens do Site" subtitle="Gerencie as imagens do seu site">
      <div className="space-y-6">
        {/* Botão topo direito (web) */}
        {!isCreating && !selectedImage && (
          <div className="flex items-center justify-end">
            <Button
              className="bg-violet-500 hover:bg-violet-600 text-white font-semibold px-3 py-2 rounded-lg shadow mx-2 md:mx-0 hidden md:block md:w-auto text-sm hover:scale-105 active:scale-95 transition-all duration-200"
              onClick={handleCreateClick}
            >
              Nova Imagem
            </Button>
          </div>
        )}

        {/* Botão flutuante mobile */}
        {!isCreating && !selectedImage && (
          <button
            className="fixed bottom-6 right-6 z-50 md:hidden bg-violet-500 hover:bg-violet-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all duration-200"
            onClick={handleCreateClick}
            aria-label="Nova Imagem"
          >
            <Plus className="w-7 h-7" />
          </button>
        )}

        <ImageSection
          images={images}
          venueId={venue.id || ""}
          isLoading={isLoading}
          isCreating={isCreating}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          onCreateClick={handleCreateClick}
          onCancelCreate={handleCancelCreate}
        />
      </div>
    </DashboardLayout>
  );
} 