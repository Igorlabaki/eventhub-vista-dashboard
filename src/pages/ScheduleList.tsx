import { ScheduleSection } from "@/components/schedule/schedule-section";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { Schedule } from "@/types/schedule";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { useVenueStore } from "@/store/venueStore";
import { useProposalStore } from "@/store/proposalStore";

export function ScheduleListPage() {
  const { id: proposalId } = useParams();
  const { selectedVenue } = useVenueStore();
  const { currentProposal } = useProposalStore();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<
    Schedule | null | undefined
  >(undefined);

  if (!proposalId) {
    return null;
  }
  const link = 
    `${selectedVenue.url}/orcamento/programacao/${proposalId}`;
  const whatsappMsg = encodeURIComponent(
    `Segue o link para registrar as atracoes do seu evento: ${link}`
  );

  const whatsappUrl = currentProposal?.whatsapp
  ? `https://wa.me/+55${currentProposal?.whatsapp.replace(/\D/g, "")}?text=${whatsappMsg}`
  : `https://wa.me/?text=${whatsappMsg}`;
  const showCreateButton = !isCreating && !selectedSchedule;

  return (
    <DashboardLayout
      title="Cronogramas"
      subtitle="Gerencie os cronogramas da proposta"
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <PageHeader
            onCreateClick={() => setIsCreating(true)}
            createButtonText="Novo Cronograma"
            isFormOpen={!showCreateButton}
          />
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2  
          text-blue-600 hover:text:black hover:underline 
          transition-colors text-sm"
          >
            Eviar link para o cliente
          </a>
        </div>

        <ScheduleSection
          proposalId={proposalId}
          isCreating={isCreating}
          selectedSchedule={selectedSchedule}
          setSelectedSchedule={setSelectedSchedule}
          onCreateClick={() => setIsCreating(true)}
          onCancelCreate={() => setIsCreating(false)}
        />
      </div>
    </DashboardLayout>
  );
}
