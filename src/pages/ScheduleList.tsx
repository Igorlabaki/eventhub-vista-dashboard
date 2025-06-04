import { ScheduleSection } from "@/components/schedule/schedule-section";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { Schedule } from "@/types/schedule";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

export function ScheduleListPage() {
  const { id: proposalId } = useParams();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null | undefined>(undefined);

  if (!proposalId) {
    return null;
  }

  return (
    <DashboardLayout
      title="Cronogramas"
      subtitle="Gerencie os cronogramas da proposta"
    >
      <div className="space-y-6">
        {!isCreating && !selectedSchedule && (
          <div className=" justify-end hidden md:flex">
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cronograma
            </Button>
          </div>
        )}

        <ScheduleSection
          proposalId={proposalId}
          isCreating={isCreating}
          selectedSchedule={selectedSchedule}
          setSelectedSchedule={setSelectedSchedule}
          onCreateClick={() => setIsCreating(true)}
          onCancelCreate={() => setIsCreating(false)}
        />

        {!isCreating && !selectedSchedule && (
          <div className="fixed bottom-6 right-6 md:hidden">
            <Button
              size="icon"
              className="h-12 w-12 rounded-full shadow-lg"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 