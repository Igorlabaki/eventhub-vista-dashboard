import { useEffect, useState } from "react";
import { ContarctPFFormPage } from "@/pages/ContarctPFForm";
import { ContarctPjFormPage } from "@/pages/ContarctPjForm";
import { proposalKeyMatches, publicContractKind, usePublicProposalKey } from "@/lib/proposal-public-url";
import { useProposalStore } from "@/store/proposalStore";

export function PublicContractPage() {
  const key = usePublicProposalKey();
  const fetchProposalById = useProposalStore((state) => state.fetchProposalById);
  const currentProposal = useProposalStore((state) => state.currentProposal);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!key) return;
    let active = true;
    setReady(false);
    fetchProposalById(key).finally(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, [key, fetchProposalById]);

  const proposal = proposalKeyMatches(currentProposal, key) ? currentProposal : null;
  if (!ready) {
    return <p className="p-8 text-center">Carregando contrato.</p>;
  }
  if (!proposal) {
    return <p className="p-8 text-center">Não foi possível carregar o contrato.</p>;
  }
  return publicContractKind(proposal) === "pj" ? <ContarctPjFormPage /> : <ContarctPFFormPage />;
}
