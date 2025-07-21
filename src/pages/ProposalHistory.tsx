import { useParams } from "react-router-dom";
import { useProposalStore } from "@/store/proposalStore";
import { useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import type { History } from "@/types/proposal";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import AccessDenied from "@/components/accessDenied";

function formatDate(dateString: string) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR");
}

export default function ProposalHistory() {
  const { id } = useParams();
  const { fetchProposalById, currentProposal, isLoading } = useProposalStore();

  useEffect(() => {
    if (id) fetchProposalById(id);
  }, [id, fetchProposalById]);

  const histories = (currentProposal?.histories || []) as History[];

  const { currentUserVenuePermission } = useUserVenuePermissionStore();
  const hasViewPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes("VIEW_PROPOSAL_HISTORY");
  };

  if (!hasViewPermission()) {
    return (
      <DashboardLayout
        title="Histórico"
        subtitle="Veja todas as ações realizadas neste orçamento"
      >
        <AccessDenied  />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Histórico" subtitle="Veja todas as ações realizadas neste orçamento">
      <div className="mx-auto bg-white rounded-xl shadow p-6 mt-4">
        {isLoading ? (
          <div className="text-center text-gray-500">Carregando histórico...</div>
        ) : histories.length === 0 ? (
          <div className="text-center text-gray-400">Nenhum histórico encontrado para este orçamento.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {histories.map((h, idx) => (
              <li key={h.id || idx} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <span className="text-gray-700 font-medium">{h.action}</span>
                <span className="text-gray-500 text-sm mt-1 sm:mt-0">{formatDate(h.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
} 