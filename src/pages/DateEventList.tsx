import { DashboardLayout } from "@/components/DashboardLayout";
import { DateEventSection } from "@/components/dateEvent/dateEvent-section";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { DateEvent } from "@/types/dateEvent";
import { useProposalStore } from "@/store/proposalStore";
import { PageHeader } from "@/components/PageHeader";

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
      title="Datas"
      subtitle="Gerencie os eventos do seu cronograma"
    >
      <div className="space-y-6">
        <PageHeader
          onCreateClick={() => setIsCreating(true)}
          createButtonText="Nova Data"
          isFormOpen={!showCreateButton}
        />

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