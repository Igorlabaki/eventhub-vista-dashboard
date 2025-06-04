import { useParams } from "react-router-dom";
import { useState } from "react";
import { Document } from "@/types/document";
import { DocumentSection } from "@/components/document/document-section";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ProposalDocuments() {
  const { id: proposalId } = useParams<{ id: string }>();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const handleCreateClick = () => {
    setIsCreating(true);
    setSelectedDocument(null);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setSelectedDocument(null);
  };

  if (!proposalId) {
    return null;
  }

  return (
    <DashboardLayout title="Documentos" subtitle="Gerencie os documentos deste orçamento">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          {!isCreating && !selectedDocument && (
            <Button
              className="
                bg-violet-500 hover:bg-violet-600 text-white md:my-0
                font-semibold px-3 py-2 rounded-lg shadow mx-2 md:mx-0 hidden md:block
                md:w-auto text-sm hover:scale-105 active:scale-95 transition-all duration-200"
              onClick={handleCreateClick}
            >
              Novo Documento
            </Button>
          )}
        </div>

        {/* Botão flutuante mobile */}
        {!isCreating && !selectedDocument && (
          <button
            className="fixed bottom-6 right-6 z-50 md:hidden bg-violet-500 hover:bg-violet-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all duration-200"
            onClick={handleCreateClick}
            aria-label="Novo Documento"
          >
            <Plus className="w-7 h-7" />
          </button>
        )}

        <DocumentSection
          proposalId={proposalId}
          isCreating={isCreating}
          selectedDocument={selectedDocument}
          setSelectedDocument={setSelectedDocument}
          onCreateClick={handleCreateClick}
          onCancelCreate={handleCancelCreate}
        />
      </div>
    </DashboardLayout>
  );
} 