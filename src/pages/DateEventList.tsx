import { DashboardLayout } from "@/components/DashboardLayout";
import { DateEventSection } from "@/components/dateEvent/dateEvent-section";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { DateEvent } from "@/types/dateEvent";
import { useProposalStore } from "@/store/proposalStore";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function DateEventListPage() {
  const { id: proposalId } = useParams();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDateEvent, setSelectedDateEvent] = useState<DateEvent | null | undefined>(null);
  const { currentProposal } = useProposalStore();

  if (!proposalId || !currentProposal) {
    return null;
  }

  const showCreateButton = !isCreating && !selectedDateEvent;

  return (
    <DashboardLayout
      title="Cronograma"
      subtitle="Gerencie os eventos do seu cronograma"
    >
      <div className="space-y-6">
        <div className="mb-6 w-full">
          <div className="flex justify-end">
            {showCreateButton && (
              <Button
                className="
                  bg-violet-500 hover:bg-violet-600 text-white
                  font-semibold px-3 py-2 rounded-lg shadow
                  text-sm hover:scale-105 active:scale-95 transition-all duration-200"
                onClick={() => setIsCreating(true)}
              >
                Nova Data
              </Button>
            )}
          </div>
          {/* Botão flutuante mobile */}
          {showCreateButton && (
            <button
              className="fixed bottom-6 right-6 z-50 md:hidden bg-violet-500 hover:bg-violet-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all duration-200"
              onClick={() => setIsCreating(true)}
              aria-label="Nova Data"
            >
              <Plus className="w-7 h-7" />
            </button>
          )}
        </div>

        <DateEventSection
          proposalId={proposalId}
          venueId={currentProposal.venueId}
          isCreating={isCreating}
          selectedDateEvent={selectedDateEvent}
          setSelectedDateEvent={setSelectedDateEvent}
          onCreateClick={() => setIsCreating(true)}
          onCancelCreate={() => {
            setIsCreating(false);
            setSelectedDateEvent(null);
          }}
        />
      </div>
    </DashboardLayout>
  );
} 