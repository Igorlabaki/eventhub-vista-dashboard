import AccessDenied from "@/components/accessDenied";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProposalAttendanceList } from "@/components/proposal/proposal-attendance-list";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";


export default function ProposalAttendanceListPage() {
  const { currentUserVenuePermission } = useUserVenuePermissionStore();

  const hasViewPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes("VIEW_PROPOSAL_ATTENDANCE_LIST");
  };



  const hasEditPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes("EDIT_PROPOSAL_ATTENDANCE_LIST");
  };

  if(!hasViewPermission()) {
    return <DashboardLayout title="Lista de Presença" subtitle="Gerencie a lista de presença da proposta">
     <AccessDenied  />
    </DashboardLayout>
  }
  return (
    <DashboardLayout 
      title="Lista de Presença" 
      subtitle="Gerencie a lista de presença da proposta"
    >
      <ProposalAttendanceList hasEditPermission={hasEditPermission()} />
    </DashboardLayout>
  );
} 