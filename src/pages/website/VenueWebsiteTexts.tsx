import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TextSection } from "@/components/text/text-section";
import { useTextStore } from "@/store/textStore";
import { Text } from "@/types/text";
import { useVenueStore } from "@/store/venueStore";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
        {/* Botão topo direito (web) */}
        {!isCreating && !selectedText && (
          <div className="flex items-center justify-end">
            <Button
              className="bg-violet-500 hover:bg-violet-600 text-white font-semibold px-3 py-2 rounded-lg shadow mx-2 md:mx-0 hidden md:block md:w-auto text-sm hover:scale-105 active:scale-95 transition-all duration-200"
              onClick={handleCreateClick}
            >
              Novo Texto
            </Button>
          </div>
        )}

        {/* Botão flutuante mobile */}
        {!isCreating && !selectedText && (
          <button
            className="fixed bottom-6 right-6 z-50 md:hidden bg-violet-500 hover:bg-violet-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all duration-200"
            onClick={handleCreateClick}
            aria-label="Novo Texto"
          >
            <Plus className="w-7 h-7" />
          </button>
        )}

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
