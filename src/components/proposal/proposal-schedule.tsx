import { useState } from "react";
import { DateEventSection } from "@/components/dateEvent/dateEvent-section";
import { useProposalStore } from "@/store/proposalStore";
import { DateEvent } from "@/types/dateEvent";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function ProposalSchedule() {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDateEvent, setSelectedDateEvent] = useState<DateEvent | null>(null);
  const { currentProposal } = useProposalStore();

  const proposalId = currentProposal?.id || "";
  const venueId = currentProposal?.venueId || "";

  const showCreateButton = !isCreating && !selectedDateEvent;

  return (
    <DashboardLayout title="Agendamento" subtitle="Gerencie as datas deste evento">
      {/* Botão desktop/tablet */}
      {showCreateButton && (
        <div className="hidden sm:flex justify-end mb-4">
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" /> Nova Data
          </Button>
        </div>
      )}
      {/* Botão flutuante mobile */}
      {showCreateButton && (
        <button
          className="sm:hidden fixed bottom-6 right-6 z-50 bg-primary text-white rounded-full shadow-lg p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/50"
          onClick={() => setIsCreating(true)}
          aria-label="Nova Data"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
      <DateEventSection
        proposalId={proposalId}
        venueId={venueId}
        isCreating={isCreating}
        selectedDateEvent={selectedDateEvent}
        setSelectedDateEvent={setSelectedDateEvent}
        onCreateClick={() => setIsCreating(true)}
        onCancelCreate={() => setIsCreating(false)}
      />
    </DashboardLayout>
  );
} 