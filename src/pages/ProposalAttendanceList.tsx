import { DashboardLayout } from "@/components/DashboardLayout";
import { ProposalAttendanceList } from "@/components/proposal/proposal-attendance-list";


export default function ProposalAttendanceListPage() {
  return (
    <DashboardLayout 
      title="Lista de Presença" 
      subtitle="Gerencie a lista de presença da proposta"
    >
      <ProposalAttendanceList      />
    </DashboardLayout>
  );
} 