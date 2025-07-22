import AccessDenied from "@/components/accessDenied";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProposalAttendanceList } from "@/components/proposal/proposal-attendance-list";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";


export default function ProposalAttendanceListPage() {
  const { currentUserVenuePermission } = useUserVenuePermissionStore();


  const hasEditPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes("EDIT_PROPOSAL_ATTENDANCE_LIST");
  };

  const hasConfirmPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes("CONFIRM_PROPOSAL_ATTENDANCE_LIST");
  };

  return (
    <DashboardLayout 
      title="Lista de Presença" 
      subtitle="Gerencie a lista de presença da proposta"
    >
      <ProposalAttendanceList hasEditPermission={hasEditPermission()} hasConfirmPermission={hasConfirmPermission()} />
    </DashboardLayout>
  );
} 