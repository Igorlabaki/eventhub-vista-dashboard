import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TextSection } from "@/components/text/text-section";
import { useTextStore } from "@/store/textStore";
import { Text } from "@/types/text";
import { useOrganizationStore } from "@/store/organizationStore";
import { PageHeader } from "@/components/PageHeader";

export default function OrganizationWebsiteTexts() {
  const { currentOrganization: organization } = useOrganizationStore();
  const { textOrganizationList: texts, isLoading, fetchTextsOrganization } = useTextStore();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedText, setSelectedText] = useState<Text | null | undefined>(
    undefined
  );

  const handleCreateClick = () => {
    setIsCreating(true);
    setSelectedText(null);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setSelectedText(null);
  };

  useEffect(() => {
    if (organization.id) {
      fetchTextsOrganization({ organizationId: organization.id });
    }
  }, [organization.id, fetchTextsOrganization]);
  
  return (
    <DashboardLayout
      title="Textos do Site"
      subtitle="Gerencie os textos do site da sua organização"
    >
      <div className="space-y-6">
        <PageHeader
          onCreateClick={handleCreateClick}
          createButtonText="Novo Texto"
          isFormOpen={isCreating || !!selectedText}
        />

        <TextSection
          texts={texts}
          type="organization"
          organizationId={organization?.id}
          isLoading={isLoading}
          isCreating={isCreating}
          selectedText={selectedText}
          setSelectedText={(text: Text | null | undefined) =>
            setSelectedText(text)
          }
          onCreateClick={handleCreateClick}
          onCancelCreate={handleCancelCreate}
        />
      </div>
    </DashboardLayout>
  );
} 