import { useParams } from "react-router-dom";
import { useProposalStore } from "@/store/proposalStore";
import { useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Users, Calendar, Clock, Share2, CheckCircle } from "lucide-react";
import { ProposalServicesSummary } from "@/components/proposal/ProposalServicesSummary";
import AccessDenied from "@/components/accessDenied";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { showSuccessToast } from "@/components/ui/success-toast";

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
  const { fetchProposalById, currentProposal, isLoading, setCurrentProposal } =
    useProposalStore();
  const { currentUserVenuePermission } = useUserVenuePermissionStore();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchProposalById(id);
    }

    // Cleanup function para limpar a proposta atual quando o componente for desmontado
    return () => {
      setCurrentProposal(null);
    };
  }, [id, fetchProposalById, setCurrentProposal]);

  const hasViewValuesPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes("VIEW_AMOUNTS");
  };

  const hasViewPersonalInfoPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes(
      "VIEW_PROPOSAL_PERSONAL_INFO"
    );
  };

  const handleShareProposal = async () => {
    if (!id) return;

    const link = `https://event-hub-dashboard.vercel.app/proposal/${id}/view`;
          try {
        await navigator.clipboard.writeText(link);
        showSuccessToast({
          title: "Link copiado!",
          description: "O link foi copiado para a área de transferência.",
        });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link. Tente novamente.",
        variant: "destructive",
      });
    }
  };

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
      <div className="w-full  mb-1">
        <Button
          className="w-full"
          onClick={handleShareProposal}
          variant="outline"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Copiar link do orçamento
        </Button>
      </div>
      <div className="mx-auto flex flex-col md:flex-row   gap-2">
        {/* Seção de Conta/Serviços isolada em componente */}
        {/* Botão para compartilhar link */}

        <ProposalServicesSummary
          hasViewValuesPermission={hasViewValuesPermission()}
        />

        {/* Informações Pessoais */}
        {hasViewPersonalInfoPermission() && (
          <div className=" rounded-xl p-6  bg-white shadow-md w-full  mx-auto">
            <h1 className="text-2xl font-bold text-center text-primary mb-10">
              Informações Pessoais
            </h1>
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
        )}
      </div>
    </DashboardLayout>
  );
}
