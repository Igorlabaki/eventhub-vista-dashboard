import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useImageStore } from "@/store/imageStore";
import { useVenueStore } from "@/store/venueStore";
import { Image } from "@/types/image";
import { PageHeader } from "@/components/PageHeader";
import { ImageSection } from "@/components/image/image-section";
import { useParams } from "react-router-dom";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
export default function VenueWebsiteImages() {
  const params = useParams();
  const venueId = params.id;
  const organizationId = params.organizationId;
  const isOrganization = Boolean(organizationId);

  const {
    images,
    isLoading,
    fetchImages,
    organizationImages,
    fetchOrganizationImages
  } = useImageStore();

  const { currentUserVenuePermission } = useUserVenuePermissionStore();

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
    if (isOrganization && organizationId) {
      fetchOrganizationImages({ organizationId });
    } else if (venueId) {
      fetchImages({ venueId });
    }
  }, [isOrganization, organizationId, venueId, fetchImages, fetchOrganizationImages]);

  const hasEditPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes(
      "EDIT_VENUE_SITE"
    );
  };

  return (
    <DashboardLayout title="Imagens do Site" subtitle="Gerencie as imagens do seu site">
      <div className="space-y-6">
        {hasEditPermission() && (
          <PageHeader
            onCreateClick={handleCreateClick}
            createButtonText="Nova Imagem"
            isFormOpen={isCreating || !!selectedImage}
          />
        )}

        <ImageSection
          hasPermission={hasEditPermission()}
          contextType={isOrganization ? "organization" : "venue"}
          images={isOrganization ? organizationImages : images}
          venueId={venueId}
          organizationId={organizationId}
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