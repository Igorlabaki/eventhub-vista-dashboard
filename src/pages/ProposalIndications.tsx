import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PublicVenueListShell } from "@/components/proposal/PublicVenueListShell";
import { PartnerPublicCard } from "@/components/proposal/PartnerPublicCard";
import {
  publicCardClass,
  publicColumnClass,
  publicDividerClass,
  publicEyebrowClass,
  publicLeadClass,
  publicTitleClass,
} from "@/components/proposal/public-list-pattern";
import { usePublicListVenue } from "@/components/proposal/usePublicListVenue";
import { useProposalStore } from "@/store/proposalStore";
import { proposalService, PublicIndication } from "@/services/proposal.service";
import { groupIndicationsByCategory } from "@/lib/partner-category";

export default function ProposalIndicationsPage() {
  const { id: proposalId } = useParams();
  const fetchProposalById = useProposalStore((s) => s.fetchProposalById);
  const currentProposal = useProposalStore((s) => s.currentProposal);
  const proposal = currentProposal?.id === proposalId ? currentProposal : null;
  const [indications, setIndications] = useState<PublicIndication[]>([]);
  const [failed, setFailed] = useState(false);
  const [listReady, setListReady] = useState(false);
  const { venue, contentReady } = usePublicListVenue(proposal?.venueId, listReady);

  useEffect(() => {
    if (!proposalId) return;
    let active = true;
    setListReady(false);
    setFailed(false);
    Promise.all([
      fetchProposalById(proposalId),
      proposalService.listProposalIndications(proposalId),
    ])
      .then(([, response]) => {
        if (!active) return;
        setIndications(response.data.indications);
      })
      .catch(() => {
        if (!active) return;
        setFailed(true);
        setIndications([]);
      })
      .finally(() => {
        if (active) setListReady(true);
      });
    return () => {
      active = false;
    };
  }, [proposalId, fetchProposalById]);

  const groups = failed ? [] : groupIndicationsByCategory(indications);

  return (
    <PublicVenueListShell venue={venue} contentReady={contentReady} variant="people">
      {(surface) => (
        <div className={`${publicColumnClass} lg:max-w-6xl`}>
          <section className={publicCardClass} style={surface.cardStyle}>
            <p className={publicEyebrowClass}>Seu evento</p>
            <h2 className={`${publicTitleClass} mt-2`}>Nossas indicações</h2>
            <p className={publicLeadClass}>Parceiros que indicamos para este orçamento.</p>
            {failed ? (
              <>
                <div className={publicDividerClass} />
                <p className={publicLeadClass}>Não foi possível carregar as indicações.</p>
              </>
            ) : indications.length === 0 ? (
              <>
                <div className={publicDividerClass} />
                <p className={publicLeadClass}>Ainda não há indicações para o seu evento.</p>
              </>
            ) : null}
          </section>
          {groups.length > 0 ? (
            <div className={groups.length > 1 ? "grid grid-cols-1 items-start gap-5 lg:grid-cols-2" : "contents"}>
              {groups.map((group) => (
                <section key={group.category} className="flex min-w-0 flex-col gap-3">
                  <h3 className={`${publicTitleClass} px-1`}>{group.label}</h3>
                  {group.items.map((item) => (
                  <PartnerPublicCard
                    key={item.id}
                    variant="public"
                    style={surface.cardStyle}
                    avatarStyle={surface.buttonStyle}
                    name={item.name}
                    description={item.description}
                    logoUrl={item.logoUrl}
                    whatsapp={item.whatsapp}
                    email={item.email}
                    instagramUrl={item.instagramUrl}
                    facebookUrl={item.facebookUrl}
                    tiktokUrl={item.tiktokUrl}
                    url={item.url}
                  />
                  ))}
                </section>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </PublicVenueListShell>
  );
}
