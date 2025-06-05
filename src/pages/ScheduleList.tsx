import { ScheduleSection } from "@/components/schedule/schedule-section";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { Schedule } from "@/types/schedule";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";

export function ScheduleListPage() {
  const { id: proposalId } = useParams();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null | undefined>(undefined);

  if (!proposalId) {
    return null;
  }

  const showCreateButton = !isCreating && !selectedSchedule;

  return (
    <DashboardLayout
      title="Cronogramas"
      subtitle="Gerencie os cronogramas da proposta"
    >
      <div className="space-y-6">
        <PageHeader
          onCreateClick={() => setIsCreating(true)}
          createButtonText="Novo Cronograma"
          isFormOpen={!showCreateButton}
        />

        <ScheduleSection
          proposalId={proposalId}
          isCreating={isCreating}
          selectedSchedule={selectedSchedule}
          setSelectedSchedule={setSelectedSchedule}
          onCreateClick={() => setIsCreating(true)}
          onCancelCreate={() => setIsCreating(false)}
        />
      </div>
    </DashboardLayout>
  );
} 