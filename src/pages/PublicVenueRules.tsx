import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { useParams } from "react-router-dom";
import { PublicVenueListShell } from "@/components/proposal/PublicVenueListShell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { publicColumnClass, publicLeadClass } from "@/components/proposal/public-list-pattern";
import { usePublicListVenue } from "@/components/proposal/usePublicListVenue";
import {
  EMPTY_PUBLIC_VENUE_RULES,
  PUBLIC_VENUE_RULES_FAILURE,
  PUBLIC_VENUE_RULES_LEAD,
  PUBLIC_VENUE_RULES_NOTICE,
  publicRuleCards,
  type PublicVenueRuleCard,
} from "@/lib/public-venue-rules";
import { venueRuleService } from "@/services/venue-rule.service";

export default function PublicVenueRulesPage() {
  const { id: venueId } = useParams();
  const [rules, setRules] = useState<PublicVenueRuleCard[]>([]);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { venue, contentReady } = usePublicListVenue(venueId, ready);
  const cards = publicRuleCards(rules);

  useEffect(() => {
    if (!venueId) return;
    let active = true;
    setReady(false);
    setFailed(false);
    setRules([]);
    venueRuleService
      .listPublic(venueId)
      .then((response) => {
        if (!active) return;
        setRules(response.data);
      })
      .catch(() => {
        if (!active) return;
        setFailed(true);
        setRules([]);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [venueId, attempt]);

  return (
    <PublicVenueListShell venue={venue} contentReady={contentReady} variant="people">
      {(surface) => (
        <div className={publicColumnClass}>
          <header>
            <h2 className="text-[28px] font-bold tracking-[-0.035em]">Regras do espaço</h2>
            <p className={publicLeadClass}>{PUBLIC_VENUE_RULES_LEAD}</p>
            {failed ? (
              <div className="mt-4">
                <p className={publicLeadClass}>{PUBLIC_VENUE_RULES_FAILURE}</p>
                <button
                  type="button"
                  className="mt-3 text-[14px] font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
                  onClick={() => setAttempt((current) => current + 1)}
                >
                  Tentar de novo
                </button>
              </div>
            ) : cards.length === 0 ? (
              <p className={publicLeadClass}>{EMPTY_PUBLIC_VENUE_RULES}</p>
            ) : (
              <p className="mt-5 flex items-start gap-3 rounded-xl border border-current/25 px-4 py-3 text-[14px] leading-[1.5]">
                <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {PUBLIC_VENUE_RULES_NOTICE}
              </p>
            )}
          </header>
          {failed || cards.length === 0 ? null : (
            <Accordion type="multiple" className="flex flex-col gap-3">
              {cards.map((rule) => (
                <AccordionItem
                  key={rule.id}
                  value={rule.id}
                  className="rounded-xl border-0 px-5 py-4 shadow-lg"
                  style={surface.cardStyle}
                >
                  <AccordionTrigger className="py-0 text-left text-[16px] font-semibold tracking-[-0.03em] hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2">
                    <span className="line-clamp-2">{rule.title ?? rule.text}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    <p className={`${publicLeadClass} whitespace-pre-wrap`}>{rule.text}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      )}
    </PublicVenueListShell>
  );
}
