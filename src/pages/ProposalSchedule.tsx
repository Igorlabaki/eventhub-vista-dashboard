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

  const hasEditPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes(
      "EDIT_PROPOSAL_SCHEDULE"
    );
  };

  const showCreateButton =
    !isCreating && !selectedSchedule && hasEditPermission();

  return (
    <DashboardLayout
      title="Programação"
      subtitle="Gerencie a programação deste evento"
    >
      <div className="space-y-6">
        {hasEditPermission() && (
          <PageHeader
            onCreateClick={() => setIsCreating(true)}
            createButtonText="Nova Programação"
            isFormOpen={!showCreateButton}
          />
        )}

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
