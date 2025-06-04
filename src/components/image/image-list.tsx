import * as React from "react";
import { cn } from "@/lib/utils";
import { FilterList } from "@/components/filterList";
import { EmptyState } from "@/components/EmptyState";
import { Pencil, Trash2, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ImageListSkeleton } from "@/components/image/image-list-skeleton";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Image } from "@/types/image";
import { useImageStore } from "@/store/imageStore";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";

interface ImageListProps {
  images: Image[];
  onDeleteImage?: (image: Image) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  selectedImageIds?: string[];
  isLoading?: boolean;
  isDeleting?: boolean;
  onCreateClick: () => void;
  onEditClick: (image: Image) => void;
}

export function ImageList({
  images,
  onDeleteImage,
  searchPlaceholder = "Filtrar imagens...",
  emptyMessage = "Nenhuma imagem encontrada",
  className,
  selectedImageIds = [],
  isLoading = false,
  isDeleting = false,
  onCreateClick,
  onEditClick
}: ImageListProps) {
  const [imageToDelete, setImageToDelete] = React.useState<Image | null>(null);
  const { deleteImage } = useImageStore();
  const { toast } = useToast();

  const handleDelete = async (imageId: string) => {
    try {
      const response = await deleteImage(imageId);
      const { title, message } = handleBackendSuccess(response, "Imagem excluída com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      setImageToDelete(null);
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao excluir imagem. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <ImageListSkeleton />;
  }

  return (
    <>
      {/* Botão web no topo direito */}
      <div className="hidden md:flex justify-end mb-4">
        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 bg-[#8854D0] text-white font-medium px-5 py-2 rounded-lg shadow hover:bg-[#6c3fc9] transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nova Imagem
        </button>
      </div>

      <div className={cn("space-y-4", className)}>
        <FilterList
          items={images}
          filterBy={(image, query) =>
            (image.description || "").toLowerCase().includes(query.toLowerCase()) ||
            (image.tag || "").toLowerCase().includes(query.toLowerCase())
          }
          placeholder={searchPlaceholder}
        >
          {(filteredImages) =>
            filteredImages?.length === 0 ? (
              <EmptyState
                title={emptyMessage}
                actionText="Nova Imagem"
                onAction={onCreateClick}
              />
            ) : (
              <Table className="bg-white rounded-md shadow-lg ">
                <TableHeader>
                  <TableRow>
                    <TableHead>Imagem</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Posição</TableHead>
                    <TableHead className="w-[100px] text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredImages.map((image) => (
                    <TableRow 
                      key={image.id}
                      className={cn(
                        "hover:bg-gray-50",
                        selectedImageIds.includes(image.id) && "bg-violet-100"
                      )}
                    >
                      <TableCell>
                        <img src={image.imageUrl} alt={image.description || ""} className="h-10 w-20 object-cover rounded" />
                      </TableCell>
                      <TableCell>
                        {image.description}
                      </TableCell>
                      <TableCell>
                        {image.position}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditClick(image);
                            }}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setImageToDelete(image);
                            }}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          }
        </FilterList>
      </div>
      <ConfirmDeleteDialog
        open={!!imageToDelete}
        onOpenChange={(open) => !open && setImageToDelete(null)}
        onConfirm={async () => {
          if (imageToDelete) {
            await handleDelete(imageToDelete.id);
          }
        }}
        entityName={imageToDelete?.description || ""}
        entityType="imagem"
        isPending={isDeleting}
      />
    </>
  );
} 