import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TextSection } from "@/components/text/text-section";
import { useTextStore } from "@/store/textStore";
import { Text } from "@/types/text";
import { useVenueStore } from "@/store/venueStore";
import { PageHeader } from "@/components/PageHeader";

export default function VenueWebsiteTexts() {
  const { selectedVenue: venue } = useVenueStore();
  const { texts, isLoading, fetchTexts } = useTextStore();
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
    if (venue.id) {
      fetchTexts({ venueId: venue.id });
    }
  }, [venue.id, fetchTexts]);

  return (
    <DashboardLayout
      title="Textos do Site"
      subtitle="Gerencie os textos do seu site"
    >
      <div className="space-y-6">
        <PageHeader
          onCreateClick={handleCreateClick}
          createButtonText="Novo Texto"
          isFormOpen={isCreating || !!selectedText}
        />

        <TextSection
          texts={texts}
          venueId={venue.id || ""}
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
