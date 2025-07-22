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
  hasPermission: boolean;
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
  hasPermission,
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
                hasEditPermission={hasPermission}
                title={emptyMessage}
                actionText="Nova Imagem"
                onAction={onCreateClick}
              />
            ) : (
              <Table className="bg-white rounded-md shadow-lg ">
                <TableHeader>
                  <TableRow>
                    <TableHead>Imagem</TableHead>
                    <TableHead>Tag</TableHead>
                    <TableHead className="hidden md:table-cell">Descrição</TableHead>
                    <TableHead>Posição</TableHead>
                    {hasPermission && <TableHead className="w-[100px] text-center">Ações</TableHead>}
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
                        {image.tag}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {image.description}
                      </TableCell>
                      <TableCell  className="text-center">
                        {image.position}
                      </TableCell>
                      {hasPermission && (
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
                      )}
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