import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import { ProposalFooter } from "@/components/proposalFooter";
import { useVenueStore } from "@/store/venueStore";
import { AppLoadingScreen } from "@/components/ui/AppLoadingScreen";
import { useProposalStore } from "@/store/proposalStore";
import PFContractPersonalInfoForm from "@/components/proposal/forms/PFContractPersonalInfoForm";


export function ContarctPFFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentProposal, isLoading: isLoadingProposal, fetchProposalById } = useProposalStore() || {};
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
        {/* Formulário simplificado para Pessoa Física */}
        {currentProposal && <PFContractPersonalInfoForm />}
      </main>
      {selectedVenue && selectedVenue.id && (
        <ProposalFooter selectedVenue={selectedVenue} />
      )}
    </div>
  );
}
