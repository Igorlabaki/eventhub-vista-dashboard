import { useEffect, useState } from "react";
import { proposalKeyMatches, usePublicProposalKey } from "@/lib/proposal-public-url";
import { PublicVenueListShell } from "@/components/proposal/PublicVenueListShell";
import { publicColumnClass, publicLeadClass } from "@/components/proposal/public-list-pattern";
import { usePublicListVenue } from "@/components/proposal/usePublicListVenue";
import PFContractPersonalInfoForm from "@/components/proposal/forms/PFContractPersonalInfoForm";
import { useProposalStore } from "@/store/proposalStore";

export function ContarctPFFormPage() {
  const id = usePublicProposalKey();
  const fetchProposalById = useProposalStore((s) => s.fetchProposalById);
  const currentProposal = useProposalStore((s) => s.currentProposal);
  const [proposalReady, setProposalReady] = useState(false);

  useEffect(() => {
    if (!id || !fetchProposalById) return;
    let active = true;
    setProposalReady(false);
    fetchProposalById(id).finally(() => {
      if (active) setProposalReady(true);
    });
    return () => {
      active = false;
    };
  }, [id, fetchProposalById]);

  const proposal = proposalKeyMatches(currentProposal, id) ? currentProposal : null;
  const { venue, contentReady } = usePublicListVenue(proposal?.venueId, proposalReady);

  if (!id) {
    return <div>Erro: ID da proposta não encontrado</div>;
  }

  return (
    <PublicVenueListShell venue={venue} contentReady={contentReady} variant="people" proposalId={proposal?.id}>
      {(surface) =>
        proposal ? (
          <PFContractPersonalInfoForm surface={surface} />
        ) : (
          <p className={`${publicColumnClass} ${publicLeadClass}`}>Não foi possível carregar o contrato.</p>
        )
      }
    </PublicVenueListShell>
  );
}
