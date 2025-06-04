import { Image, UpdateImageDTO } from "@/types/image";
import { ImageList } from "./image-list";
import { ImageListSkeleton } from "./image-list-skeleton";
import { ImageForm } from "./image-form";
import { useImageStore } from "@/store/imageStore";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";

interface ImageSectionProps {
  images: Image[];
  venueId: string;
  isLoading: boolean;
  isCreating: boolean;
  selectedImage: Image | null | undefined;
  setSelectedImage: (image: Image | null | undefined) => void;
  onCreateClick: () => void;
  onCancelCreate: () => void;
}

export function ImageSection({
  images,
  venueId,
  isLoading,
  isCreating,
  selectedImage,
  setSelectedImage,
  onCreateClick,
  onCancelCreate,
}: ImageSectionProps) {
  const { createImage, updateImage } = useImageStore();
  const { toast } = useToast();

  const handleSubmit = async (data: UpdateImageDTO) => {
    try {
      let response;
      if (selectedImage) {
        response = await updateImage({
          imageId: selectedImage.id,
          venueId,
          file: data.file,
          responsiveMode: data.responsiveMode,
          imageUrl: data.imageUrl,
          description: data.description || "",
          tag: data.tag,
          position: data.position,
        });
        const { title, message } = handleBackendSuccess(response, "Imagem atualizada com sucesso!");
        showSuccessToast({
          title,
          description: message
        });
      } else {
        response = await createImage({
          imageUrl: data.imageUrl,
          description: data.description || "",
          tag: data.tag,
          position: data.position,
          venueId,
          file: data.file,
          responsiveMode: data.responsiveMode,
        });
        const { title, message } = handleBackendSuccess(response, "Imagem criada com sucesso!");
        showSuccessToast({
          title,
          description: message
        });
      }
      setSelectedImage(undefined);
      onCancelCreate();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao salvar imagem. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  const showForm = isCreating || !!selectedImage;

  return (
    <div className="animate-fade-in">
      {isLoading ? (
        <ImageListSkeleton />
      ) : (
        <AnimatedFormSwitcher
          showForm={showForm}
          list={
            <ImageList
              images={images || []}
              onCreateClick={onCreateClick}
              onEditClick={setSelectedImage}
            />
          }
          form={
            <ImageForm
              imageItem={selectedImage}
              venueId={venueId}
              onSubmit={handleSubmit}
              onCancel={() => {
                setSelectedImage(undefined);
                onCancelCreate();
              }}
            />
          }
        />
      )}
    </div>
  );
} 