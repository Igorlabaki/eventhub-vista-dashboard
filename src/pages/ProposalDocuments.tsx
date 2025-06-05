import { useParams } from "react-router-dom";
import { useState } from "react";
import { Document } from "@/types/document";
import { DocumentSection } from "@/components/document/document-section";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";

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

  const showCreateButton = !isCreating && !selectedDocument;

  return (
    <DashboardLayout title="Documentos" subtitle="Gerencie os documentos deste orçamento">
      <div className="space-y-6">
        <PageHeader
          onCreateClick={handleCreateClick}
          createButtonText="Novo Documento"
          isFormOpen={!showCreateButton}
        />

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