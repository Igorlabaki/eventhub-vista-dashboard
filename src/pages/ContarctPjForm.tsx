import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import { ProposalFooter } from "@/components/proposalFooter";
import { useVenueStore } from "@/store/venueStore";
import { AppLoadingScreen } from "@/components/ui/AppLoadingScreen";
import { ClientPerDayProposalForm } from "@/components/proposal/forms/ClientPerDayProposalForm";
import { PerPersonProposalForm } from "@/components/proposal/forms/PerPersonProposalForm";
import { ClientPerPersonProposalForm } from "@/components/proposal/forms/ClientPerPersonProposalForm";
import { useProposalStore } from "@/store/proposalStore";
import PJContractPersonalInfoForm from "@/components/proposal/forms/PJContractPersonalInfoForm";

export function ContarctPjFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentProposal, isLoading: isLoadingProposal, fetchProposalById, updateProposal } =
    useProposalStore() || {};
  const { selectedVenue, fetchVenueById, isLoading: isLoadingVenue } = useVenueStore();

  useEffect(() => {
    const loadVenue = async () => {
      if (!id || !fetchProposalById) return;

      try {
        const proposal = await fetchProposalById(id);
        if (proposal?.venueId) {
          await fetchVenueById(proposal.venueId);
        }
      } catch (error) {
        console.error("Erro ao buscar venue:", error);
      }
    };

    loadVenue();
  }, [id, fetchProposalById, fetchVenueById]);

  if (!id) {
    console.error("ID do venue não encontrado");
    return <div>Erro: ID do venue não encontrado</div>;
  }

  const handleBack = () => {
    try {
      // Volta para a página anterior ou para uma rota específica
      window.history.back();
    } catch (error) {
      console.error("Erro ao voltar:", error);
      // Fallback: navegar para uma rota específica
      navigate("/");
    }
  };

  if (isLoadingProposal || isLoadingVenue || isLoadingVenue === undefined) {
    return <AppLoadingScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex flex-1 flex-col bg-eventhub-background py-14 px-2 md:px-8">
        <div className="flex items-center w-full justify-center mb-10">
          <Calendar className="h-8 w-8 text-eventhub-primary" />
          <span className="ml-2 font-bold text-3xl text-eventhub-primary">
            EventHub
          </span>
        </div>

        {/* Renderiza o formulário correto baseado no tipo de venue */}
        {currentProposal && <PJContractPersonalInfoForm />}
      </main>
      {selectedVenue && selectedVenue.id && (
        <ProposalFooter selectedVenue={selectedVenue} />
      )}
    </div>
  );
}
