import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import { ProposalFooter } from "@/components/proposalFooter";
import { useVenueStore } from "@/store/venueStore";
import { AppLoadingScreen } from "@/components/ui/AppLoadingScreen";
import { ClientPerDayProposalForm } from "@/components/proposal/forms/ClientPerDayProposalForm";
import { PerPersonProposalForm } from "@/components/proposal/forms/PerPersonProposalForm";
import { ClientPerPersonProposalForm } from "@/components/proposal/forms/ClientPerPersonProposalForm";

export function ProposalForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedVenue, isLoading, fetchVenueById } = useVenueStore() || {};

  useEffect(() => {
    const loadVenue = async () => {
      if (!id || !fetchVenueById) return;

      try {
        await fetchVenueById(id);
      } catch (error) {
        console.error("Erro ao buscar venue:", error);
      }
    };

    loadVenue();
  }, [id, fetchVenueById]);

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

  if (isLoading || isLoading === undefined) {
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
        {selectedVenue && selectedVenue.hasOvernightStay ? (
          <ClientPerDayProposalForm venueId={id!} onBack={handleBack} />
        ) : selectedVenue ? (
          <ClientPerPersonProposalForm venueId={id!} onBack={handleBack} />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Carregando informações do venue...</p>
          </div>
        )}
      </main>
              {selectedVenue && selectedVenue.id && <ProposalFooter selectedVenue={selectedVenue} />}
    </div>
  );
}
