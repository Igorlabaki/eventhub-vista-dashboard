import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useImageStore } from "@/store/imageStore";
import { useOrganizationStore } from "@/store/organizationStore";
import { Image } from "@/types/image";
import { PageHeader } from "@/components/PageHeader";
import { ImageSection } from "@/components/image/image-section";
import { useUserOrganizationPermissionStore } from "@/store/userOrganizationPermissionStore";
export default function OrganizationWebsiteImages() {
  const { currentOrganization: organization } = useOrganizationStore();
  const { currentUserOrganizationPermission } =
    useUserOrganizationPermissionStore();
  const { images, isLoading, fetchOrganizationImages, organizationImages } =
    useImageStore();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image | null | undefined>(
    undefined
  );

  const handleCreateClick = () => {
    setIsCreating(true);
    setSelectedImage(null);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setSelectedImage(null);
  };

  useEffect(() => {
    if (organization?.id) {
      fetchOrganizationImages({ organizationId: organization.id });
    }
  }, [organization?.id, fetchOrganizationImages]);

  const hasEditPermission = () => {
    if (!currentUserOrganizationPermission?.permissions) return false;
    return currentUserOrganizationPermission.permissions.includes(
      "EDIT_ORG_WEBSITE_IMAGES"
    );
  };

  return (
    <DashboardLayout
      title="Imagens do Site"
      subtitle="Gerencie as imagens do site da sua organização"
    >
      <div className="space-y-6">
        {hasEditPermission() && (
          <PageHeader
            isFormOpen={isCreating || !!selectedImage}
            count={organizationImages?.length}
            onCreateClick={handleCreateClick}
            createButtonText="Nova Imagem"
          />
        )}
        <ImageSection
          hasPermission={hasEditPermission()}
          contextType="organization"
          images={organizationImages}
          organizationId={organization?.id}
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
