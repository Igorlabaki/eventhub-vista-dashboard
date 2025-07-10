import { DashboardLayout } from "@/components/DashboardLayout";
import { ProposalAttendanceList } from "@/components/proposal/proposal-attendance-list";
import { ScheduleSection } from "@/components/schedule/schedule-section";
import { useState } from "react";
import { Schedule } from "@/types/schedule";
import { useParams } from "react-router-dom";
import { useProposalStore } from "@/store/proposalStore";
import { PageHeader } from "@/components/PageHeader";

export default function ProposalSchedulePage() {
  const { id: proposalId } = useParams();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null | undefined>(null);
  const { currentProposal } = useProposalStore();

  if (!proposalId || !currentProposal) {
    return null;
  }

  const showCreateButton = !isCreating && !selectedSchedule;

  return (
    <DashboardLayout 
      title="Programação" 
      subtitle="Gerencie a programação deste evento"
    >
      <div className="space-y-6">
        <PageHeader
          onCreateClick={() => setIsCreating(true)}
          createButtonText="Nova Programação"
          isFormOpen={!showCreateButton}
        />

        <ScheduleSection
          proposalId={proposalId}
          isCreating={isCreating}
          selectedSchedule={selectedSchedule}
          setSelectedSchedule={setSelectedSchedule}
          onCreateClick={() => setIsCreating(true)}
          onCancelCreate={() => {
            setIsCreating(false);
            setSelectedSchedule(null);
          }}
        />
      </div>
    </DashboardLayout>
  );
} 