import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useImageStore } from "@/store/imageStore";
import { useVenueStore } from "@/store/venueStore";
import { Image } from "@/types/image";
import { PageHeader } from "@/components/PageHeader";
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
        <PageHeader
          onCreateClick={handleCreateClick}
          createButtonText="Nova Imagem"
          isFormOpen={isCreating || !!selectedImage}
        />

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