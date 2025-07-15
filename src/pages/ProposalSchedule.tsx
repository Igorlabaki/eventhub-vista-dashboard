import { DashboardLayout } from "@/components/DashboardLayout";
import { ProposalAttendanceList } from "@/components/proposal/proposal-attendance-list";
import { ScheduleSection } from "@/components/schedule/schedule-section";
import { useState } from "react";
import { Schedule } from "@/types/schedule";
import { useParams } from "react-router-dom";
import { useProposalStore } from "@/store/proposalStore";
import { PageHeader } from "@/components/PageHeader";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import AccessDenied from "@/components/accessDenied";
import { Button } from "@/components/ui/button";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";

export default function ProposalSchedulePage() {
  const { id: proposalId } = useParams();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<
    Schedule | null | undefined
  >(null);
  const { currentProposal } = useProposalStore();
  const { currentUserVenuePermission } = useUserVenuePermissionStore();
  if (!proposalId || !currentProposal) {
    return null;
  }

  const hasViewPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes("VIEW_PROPOSAL_SCHEDULE");
  };

  const hasEditPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes("EDIT_PROPOSAL_SCHEDULE");
  };

  const showCreateButton = !isCreating && !selectedSchedule && hasEditPermission();

  if (!hasViewPermission()) {
    return (
      <DashboardLayout
        title="Cronograma"
        subtitle="Gerencie o cronograma da proposta"
      >
        <AccessDenied />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Programação"
      subtitle="Gerencie a programação deste evento"
    >
      <div className="space-y-6">
        {/*  <PageHeader
          hasEditPermission={hasEditPermission()}
          onCreateClick={() => setIsCreating(true)}
          createButtonText="Nova Programação"
          isFormOpen={!showCreateButton}
        /> */}

        <>
          <div className="flex justify-start items-center mb-6 w-full">
            {showCreateButton && hasEditPermission() && (
              <Button
                onClick={() => setIsCreating(true)}
                className="shadow-lg flex-row items-center gap-2 bg-eventhub-primary hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all duration-200 hidden md:flex"
              >
                <Plus  className="w-7 h-7" />
                <p>{"Nova Programação"}</p>
              </Button>
            )}
          </div>
          {/* Botão flutuante mobile via Portal para ficar sempre fixo no viewport */}
          {showCreateButton && hasEditPermission() &&
            createPortal(
              <button
                className="fixed bottom-6 right-6 z-50 md:hidden bg-eventhub-primary hover:bg-indigo-600 text-white rounded-full shadow-2xl p-4 flex items-center justify-center transition-all duration-200"
                onClick={() => setIsCreating(true)}
                aria-label={"Nova Programação"}
              >
                <Plus className="w-7 h-7" />
              </button>,
              document.body
            )}
        </>

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
