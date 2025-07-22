import * as React from "react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";
import { Pencil, Trash2, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DocumentListSkeleton } from "./document-list-skeleton";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Document, DocumentType } from "@/types/document";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useDocumentStore } from "@/store/documentStore";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";

interface DocumentListProps {
  documents: Document[];
  onDeleteDocument?: (document: Document) => void;
  emptyMessage?: string;
  className?: string;
  selectedDocumentIds?: string[];
  isLoading?: boolean;
  isDeleting?: boolean;
  onCreateClick: () => void;
  onEditClick: (document: Document) => void;
}

export function DocumentList({
  documents,
  onDeleteDocument,
  emptyMessage = "Nenhum documento encontrado",
  className,
  selectedDocumentIds = [],
  isLoading = false,
  isDeleting = false,
  onCreateClick,
  onEditClick,
}: DocumentListProps) {
  const [documentToDelete, setDocumentToDelete] =
    React.useState<Document | null>(null);
  const { deleteDocument } = useDocumentStore();
  const { toast } = useToast();
  const { currentUserVenuePermission } = useUserVenuePermissionStore();
  const handleDelete = async (documentId: string) => {
    try {
      const response = await deleteDocument(documentId);
      const { title, message } = handleBackendSuccess(
        response,
        "Documento excluído com sucesso!"
      );
      showSuccessToast({
        title,
        description: message,
      });
      setDocumentToDelete(null);
    } catch (error: unknown) {
      const { title, message } = handleBackendError(
        error,
        "Erro ao excluir documento. Tente novamente mais tarde."
      );
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleView = (document: Document) => {
    window.open(document.imageUrl, "_blank");
  };

  if (isLoading) {
    return <DocumentListSkeleton />;
  }

  const hasEditPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes(
      "EDIT_PROPOSAL_DOCUMENTS"
    );
  };

  const hasViewPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes(
      "VIEW_PROPOSAL_DOCUMENTS"
    );
  };

  if (!documents || documents.length === 0) {
    return (
      <EmptyState
        hasEditPermission={hasEditPermission()}
        title={emptyMessage}
        actionText="Novo Documento"
        onAction={onCreateClick}
      />
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Table className="bg-white rounded-md shadow-lg ">
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            {hasEditPermission() ||
              (hasViewPermission() && (
                <TableHead className="w-[150px] text-center">Ações</TableHead>
              ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow
              key={document.id}
              className={cn(
                "hover:bg-gray-50",
                selectedDocumentIds.includes(document.id) && "bg-violet-100"
              )}
            >
              <TableCell className="font-medium">{document.title}</TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  {hasViewPermission() && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(document);
                      }}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="Visualizar documento"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  {hasEditPermission() && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditClick(document);
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Editar documento"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDocumentToDelete(document);
                        }}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Excluir documento"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmDeleteDialog
        open={!!documentToDelete}
        onOpenChange={(open) => !open && setDocumentToDelete(null)}
        onConfirm={async () => {
          if (documentToDelete) {
            await handleDelete(documentToDelete.id);
          }
        }}
        entityName={
          documentToDelete ? `Documento "${documentToDelete.title}"` : ""
        }
        entityType="documento"
        isPending={isDeleting}
      />
    </div>
  );
}
