import { useParams } from "react-router-dom";
import { useProposalStore } from "@/store/proposalStore";
import { useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Users, Calendar, Clock } from "lucide-react";
import { ProposalServicesSummary } from "@/components/proposal/ProposalServicesSummary";
import AccessDenied from "@/components/accessDenied";
import { useUserPermissionStore } from "@/store/userPermissionStore";

function ProposalDetailsSkeleton() {
  return (
    <div className="mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col gap-8 mt-8 max-w-xl animate-pulse">
      {/* Título */}
      <div className="h-6 w-1/3 bg-gray-200 rounded mb-6 mx-auto" />
      {/* Ícones e infos */}
      <div className="flex flex-col sm:flex-row justify-center gap-6 mb-6">
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 shadow-sm w-36">
          <div className="h-6 w-6 bg-gray-300 rounded-full" />
          <div className="h-4 w-8 bg-gray-300 rounded" />
          <div className="h-3 w-12 bg-gray-200 rounded" />
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 shadow-sm w-36">
          <div className="h-6 w-6 bg-gray-300 rounded-full" />
          <div className="h-4 w-16 bg-gray-300 rounded" />
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 shadow-sm w-36">
          <div className="h-6 w-6 bg-gray-300 rounded-full" />
          <div className="h-4 w-16 bg-gray-300 rounded" />
        </div>
      </div>
      {/* Card de valores */}
      <div className="bg-gray-200 rounded-xl p-6 mb-6 w-full max-w-md mx-auto flex flex-col gap-3">
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-gray-300 rounded" />
          <div className="h-4 w-16 bg-gray-300 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-gray-300 rounded" />
          <div className="h-4 w-16 bg-gray-300 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-gray-300 rounded" />
          <div className="h-4 w-16 bg-gray-300 rounded" />
        </div>
        <div className="flex justify-between mt-4">
          <div className="h-5 w-20 bg-gray-400 rounded" />
          <div className="h-5 w-24 bg-gray-400 rounded" />
        </div>
      </div>
      {/* Descrição */}
      <div>
        <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
        <div className="h-8 w-full bg-gray-100 rounded" />
      </div>
      {/* Informações pessoais */}
      <div>
        <div className="h-5 w-1/4 bg-gray-200 rounded mb-4 mx-auto" />
        <div className="flex flex-col gap-3 items-center">
          <div className="h-4 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-40 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function ProposalDetails() {
  const { id } = useParams();
  const { fetchProposalById, currentProposal, isLoading, setCurrentProposal } = useProposalStore();
  const { currentUserPermission } = useUserPermissionStore();
  
  useEffect(() => {
    if (id) {
      fetchProposalById(id);
    }
    
    // Cleanup function para limpar a proposta atual quando o componente for desmontado
    return () => {
      setCurrentProposal(null);
    };
  }, [id, fetchProposalById, setCurrentProposal]);

  const hasViewPermission = () => {
    if (!currentUserPermission?.permissions) return false;
    return currentUserPermission.permissions.includes("VIEW_PROPOSAL_INFO");
  };

  const hasViewValuesPermission = () => {
    if (!currentUserPermission?.permissions) return false;
    return currentUserPermission.permissions.includes("VIEW_AMOUNTS");
  };


    if(!hasViewPermission()) {
    return <DashboardLayout title="Contatos" subtitle="Gerencie os contatos do espaço">
     <AccessDenied />
    </DashboardLayout>
  }

  if (isLoading)
    return (
      <DashboardLayout
        title="Detalhes do Orçamento"
        subtitle="Visão geral do orçamento/proposta"
      >
        <ProposalDetailsSkeleton />
      </DashboardLayout>
    );

  if (!currentProposal)
    return (
      <DashboardLayout
        title="Detalhes do Orçamento"
        subtitle="Visão geral do orçamento/proposta"
      >
        <div className="flex justify-center items-center h-40 text-destructive text-lg font-medium">
          Orçamento não encontrado.
        </div>
      </DashboardLayout>
    );

  const {
    completeClientName,
    email,
    whatsapp,
    startDate,
    endDate,
    guestNumber,
    basePrice,
    totalAmount,
    extraHourPrice,
    extraHoursQty,
    description,
    trafficSource,
    knowsVenue,
    createdAt,
    approved,
    type,
    proposalServices = [],
  } = currentProposal;

  // Calcular soma dos serviços adicionais
  const servicosAdicionais = (proposalServices || []).map((ps) => ({
    name: ps.service?.name,
    price: ps.service?.price || 0,
  }));
  const somaServicos = servicosAdicionais.reduce(
    (acc, s) => acc + (s.price || 0),
    0
  );

  return (
    <DashboardLayout
      title="Orçamento"
      subtitle="Visão geral do orçamento/proposta"
    >
      <div className="mx-auto flex flex-col md:flex-row   gap-2">
        {/* Seção de Conta/Serviços isolada em componente */}
       
        <ProposalServicesSummary hasViewValuesPermission={hasViewValuesPermission()} />
       
        {/* Informações Pessoais */}
        <div className=" rounded-xl p-6 mb-6 bg-white shadow-md w-full max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-center text-primary mb-10">Informações Pessoais</h1>
          <div className="flex flex-col gap-3 items-center w-full">
            <div className="w-full flex justify-between">
              <span className="text-gray-500">Nome:</span>{" "}
              <span className="font-semibold text-gray-600">
                {completeClientName || "-"}
              </span>
            </div>
            <div className="w-full flex justify-between">
              <span className="text-gray-500">Email:</span>{" "}
              <span className="font-semibold text-gray-600">
                {email || "-"}
              </span>
            </div>
            <div className="w-full flex justify-between">
              <span className="text-gray-500">Whatsapp:</span>{" "}
              <span className="font-semibold text-gray-600">
                {whatsapp || "-"}
              </span>
            </div>
            <div className="w-full flex justify-between">
              <span className="text-gray-500">Já conhece o espaço:</span>{" "}
              <span className="font-semibold text-gray-600">
                {knowsVenue ? "Sim" : "Não"}
              </span>
            </div>
            <div className="w-full flex justify-between">
              <span className="text-gray-500">Por onde nos conheceu:</span>{" "}
              <span className="font-semibold text-gray-600">
                {trafficSource || "-"}
              </span>
            </div>
            <div className="w-full flex justify-between">
              <span className="text-gray-500">Data do orcamento:</span>{" "}
              <span className="font-semibold text-gray-600">
                {createdAt
                  ? new Date(createdAt).toLocaleDateString("pt-BR")
                  : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
