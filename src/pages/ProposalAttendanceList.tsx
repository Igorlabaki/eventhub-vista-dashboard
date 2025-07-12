import AccessDenied from "@/components/accessDenied";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProposalAttendanceList } from "@/components/proposal/proposal-attendance-list";
import { useUserPermissionStore } from "@/store/userPermissionStore";


export default function ProposalAttendanceListPage() {
  const { currentUserPermission } = useUserPermissionStore();

  const hasViewPermission = () => {
    if (!currentUserPermission?.permissions) return false;
    return currentUserPermission.permissions.includes("VIEW_ATTENDANCE_LIST");
  };



  const hasEditPermission = () => {
    if (!currentUserPermission?.permissions) return false;
    return currentUserPermission.permissions.includes("EDIT_ATTENDANCE_LIST");
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