import { Document } from "@/types/document";
import { DocumentList } from "./document-list";
import { DocumentListSkeleton } from "./document-list-skeleton";
import { DocumentForm } from "./document-form";
import { useDocumentStore } from "@/store/documentStore";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";
import { useEffect } from "react";
import { CreateDocumentDTO } from "@/types/document";

interface DocumentSectionProps {
  proposalId: string;
  isCreating: boolean;
  selectedDocument: Document | null | undefined;
  setSelectedDocument: (document: Document | null | undefined) => void;
  onCreateClick: () => void;
  onCancelCreate: () => void;
}

export function DocumentSection({
  proposalId,
  isCreating,
  selectedDocument,
  setSelectedDocument,
  onCreateClick,
  onCancelCreate,
}: DocumentSectionProps) {
  const {
    createDocument,
    updateDocument,
    deleteDocument,
    documents,
    isLoading,
    fetchDocuments,
  } = useDocumentStore();
  const { toast } = useToast();

  // Carregar documentos quando o componente montar ou proposalId mudar
  useEffect(() => {
    fetchDocuments({ proposalId });
  }, [proposalId, fetchDocuments]);

  const handleSubmit = async (data: CreateDocumentDTO) => {
    try {
      let response;
      if (selectedDocument) {
        response = await updateDocument({
          documentId: selectedDocument.id,
          title: data.title,
          imageUrl: data.imageUrl || "",
          file: data.file,
          fileType: data.fileType,
        });
      } else {
        response = await createDocument(data);
      }

      const { title, message } = handleBackendSuccess(
        response,
        "Documento salvo com sucesso!"
      );
      showSuccessToast({ title, description: message });

      await fetchDocuments({ proposalId });
      setSelectedDocument(undefined);
      onCancelCreate();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(
        error,
        "Erro ao salvar documento."
      );
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (
    data: CreateDocumentDTO & { documentId: string }
  ) => {
    try {
      const response = await updateDocument({
        documentId: data.documentId,
        title: data.title,
        imageUrl: data.imageUrl || "",
        file: data.file,
        fileType: data.fileType,
      });

      const { title, message } = handleBackendSuccess(
        response,
        "Documento atualizado com sucesso!"
      );
      showSuccessToast({ title, description: message });

      await fetchDocuments({ proposalId });
      setSelectedDocument(undefined);
      onCancelCreate();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(
        error,
        "Erro ao atualizar documento."
      );
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(id);
      await fetchDocuments({ proposalId });
      setSelectedDocument(undefined);
      onCancelCreate();
      showSuccessToast({
        title: "Sucesso",
        description: "Documento excluído com sucesso!",
      });
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

  const showForm = isCreating || !!selectedDocument;

  return (
    <div className="animate-fade-in">
      {isLoading ? (
        <DocumentListSkeleton />
      ) : (
        <AnimatedFormSwitcher
          showForm={showForm}
          list={
            <DocumentList
              documents={documents}
              onCreateClick={onCreateClick}
              onEditClick={setSelectedDocument}
              onDeleteDocument={(document) => handleDelete(document.id)}
            />
          }
          form={
            <DocumentForm
              document={selectedDocument}
              proposalId={proposalId}
              onSubmit={handleSubmit}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onCancel={onCancelCreate}
            />
          }
        />
      )}
    </div>
  );
}
