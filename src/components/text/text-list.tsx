import * as React from "react"
import { cn } from "@/lib/utils"
import { FilterList } from "@/components/filterList"
import { EmptyState } from "@/components/EmptyState"
import { Pencil, Trash2, Plus } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TextListSkeleton } from "@/components/text/text-list-skeleton"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import { Text } from "@/types/text"
import { useTextStore } from "@/store/textStore"
import { showSuccessToast } from "@/components/ui/success-toast"
import { useToast } from "@/hooks/use-toast"
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler"

interface TextListProps {
  texts: Text[]
  onDeleteText?: (text: Text) => void
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  hasPermission: boolean
  selectedTextIds?: string[]
  isLoading?: boolean
  isDeleting?: boolean
  onCreateClick: () => void
  onEditClick: (text: Text) => void
}

export function TextList({
  texts,
  onDeleteText,
  hasPermission,  
  searchPlaceholder = "Filtrar textos...",
  emptyMessage = "Nenhum texto encontrado",
  className,
  selectedTextIds = [],
  isLoading = false,
  isDeleting = false,
  onCreateClick,
  onEditClick
}: TextListProps) {
  const [textToDelete, setTextToDelete] = React.useState<Text | null>(null);
  const { deleteText } = useTextStore();
  const { toast } = useToast();

  const handleDelete = async (textId: string) => {
    try {
      const response = await deleteText(textId);
      const { title, message } = handleBackendSuccess(response, "Texto excluído com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      setTextToDelete(null);
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao excluir texto. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <TextListSkeleton />;
  }

  return (
    <>


      <div className={cn("space-y-4", className)}>
        <FilterList
          items={texts}
          filterBy={(text, query) =>
            text.title?.toLowerCase().includes(query.toLowerCase()) ||
            text.area.toLowerCase().includes(query.toLowerCase())
          }
          placeholder={searchPlaceholder}
        >
          {(filteredTexts) =>
            filteredTexts?.length === 0 ? (
              <EmptyState
                hasEditPermission={hasPermission}
                title={emptyMessage}
                actionText="Novo Texto"
                onAction={onCreateClick}
              />
            ) : (
              <Table className="bg-white rounded-md shadow-lg ">
                <TableHeader>
                  <TableRow>
                    <TableHead>Área</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Posição</TableHead>
                    {hasPermission && <TableHead className="w-[100px] text-center">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTexts.map((text) => (
                    <TableRow 
                      key={text.id}
                      className={cn(
                        "hover:bg-gray-50",
                        selectedTextIds.includes(text.id) && "bg-violet-100"
                      )}
                    >
                      <TableCell 
                        className="font-medium cursor-pointer"
                        onClick={() => hasPermission && onEditClick(text)}
                      >
                        {text.area}
                      </TableCell>
                      <TableCell>
                        {text.title || "-"}
                      </TableCell>
                      <TableCell>
                        {text.position}
                      </TableCell>
                      {hasPermission && ( 
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditClick(text);
                            }}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTextToDelete(text);
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
        open={!!textToDelete}
        onOpenChange={(open) => !open && setTextToDelete(null)}
        onConfirm={async () => {
          if (textToDelete) {
            await handleDelete(textToDelete.id);
          }
        }}
        entityName={textToDelete?.title || textToDelete?.area || ""}
        entityType="texto"
        isPending={isDeleting}
      />
    </>
  )
} 