import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowUpRight, Calendar, CalendarDays, FileText, Handshake, IdCard, ScrollText, Users } from "lucide-react";
import { PublicVenueListShell } from "@/components/proposal/PublicVenueListShell";
import { publicColumnClass, publicDividerClass, publicEyebrowClass, publicLeadClass, publicTitleClass } from "@/components/proposal/public-list-pattern";
import { usePublicListVenue } from "@/components/proposal/usePublicListVenue";
import {
  eventCountdown,
  eventLinkDestinations,
  eventLinkSummary,
  type EventLinkIcon,
  type EventLinkSummary,
} from "@/lib/event-link";
import { proposalService } from "@/services/proposal.service";

type EventClock = {
  venueId?: string;
  startDate: string | Date | null;
  endDate: string | Date | null;
};

const linkIcons: Record<EventLinkIcon, typeof FileText> = {
  budget: FileText,
  partners: Handshake,
  schedule: CalendarDays,
  guests: Users,
  staff: IdCard,
  rules: ScrollText,
};

const cardClass =
  "rounded-xl border border-current/15 px-4 py-4 shadow-none transition-[filter] duration-200 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

export default function ProposalEventLinkPage() {
  const { id: proposalId } = useParams();
  const [summary, setSummary] = useState<EventLinkSummary | null>(null);
  const [clock, setClock] = useState<EventClock | null>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const now = useNow();
  const { venue, contentReady } = usePublicListVenue(clock?.venueId, ready);
  const countdown = eventCountdown(clock?.startDate, clock?.endDate, now);
  const links = proposalId ? eventLinkDestinations(proposalId, clock?.venueId) : [];

  useEffect(() => {
    if (!proposalId) return;
    let active = true;
    setReady(false);
    setFailed(false);
    proposalService
      .getProposalById(proposalId)
      .then((response) => {
        if (!active) return;
        const proposal = response.data;
        if (!proposal?.venueId) {
          setFailed(true);
          setSummary(null);
          setClock(null);
          return;
        }
        setSummary(eventLinkSummary(proposal));
        setClock({
          venueId: proposal.venueId,
          startDate: proposal.startDate ?? null,
          endDate: proposal.endDate ?? null,
        });
      })
      .catch(() => {
        if (!active) return;
        setFailed(true);
        setSummary(null);
        setClock(null);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [proposalId]);

  const facts = [
    summary?.dayLabel ? { label: "Data", value: summary.dayLabel } : null,
    summary?.timeLabel ? { label: "Horário", value: summary.timeLabel } : null,
    summary?.guestLabel ? { label: "Convidados", value: summary.guestLabel } : null,
  ].filter((fact) => fact !== null);

  return (
    <PublicVenueListShell venue={venue} contentReady={contentReady} variant="schedule">
      {(surface) => (
        <div className={publicColumnClass}>
          <section className={`${cardClass} px-5 py-5`} style={surface.cardStyle}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={publicEyebrowClass}>Seu evento</p>
                <h2 className={`${publicTitleClass} mt-2`}>Resumo do evento</h2>
              </div>
              <Calendar className="mt-1 h-5 w-5 opacity-70" aria-hidden />
            </div>
            {failed ? (
              <p className={publicLeadClass}>Não foi possível carregar o evento.</p>
            ) : facts.length === 0 ? (
              <p className={publicLeadClass}>Ainda não há data para este evento.</p>
            ) : (
              <dl className="mt-5 grid grid-cols-3 gap-3">
                {facts.map((fact) => (
                  <div key={fact.label}>
                    <dt className={publicEyebrowClass}>{fact.label}</dt>
                    <dd className="mt-1 text-[16px] font-semibold tracking-[-0.02em]">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {countdown.kind !== "hidden" ? (
              <>
                <div className={publicDividerClass} />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className={publicEyebrowClass}>Contagem regressiva</p>
                    <p className="mt-2 text-[16px] font-semibold tracking-[-0.02em]">{countdown.phrase}</p>
                  </div>
                  {countdown.kind === "countdown" ? (
                    <p className="flex items-baseline gap-1.5" aria-live="polite">
                      <span className="text-[32px] font-semibold tabular-nums leading-none">{countdown.parts.days}</span>
                      <span className="text-[13px] opacity-70">{countdown.parts.days === "01" ? "dia" : "dias"}</span>
                      <span className="text-[32px] font-semibold tabular-nums leading-none">{countdown.parts.hours}</span>
                      <span className="text-[13px] opacity-70">h</span>
                      <span className="text-[32px] font-semibold tabular-nums leading-none">{countdown.parts.minutes}</span>
                      <span className="text-[13px] opacity-70">min</span>
                    </p>
                  ) : null}
                </div>
              </>
            ) : null}
          </section>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-[16px] font-semibold tracking-[-0.02em]">Gerencie seu evento</h2>
            <p className="text-[13px] opacity-60">Acesso rápido</p>
          </div>
          <nav className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Páginas do evento">
            {links.map((item, index) => {
              const Icon = linkIcons[item.icon];
              const wide = index === links.length - 1 && links.length % 2 === 1;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`${cardClass} relative ${wide ? "sm:col-span-2" : ""}`}
                  style={surface.cardStyle}
                >
                  <Icon className="h-5 w-5 opacity-80" aria-hidden />
                  <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 opacity-60" aria-hidden />
                  <span className="mt-6 block text-[16px] font-semibold tracking-[-0.02em]">{item.label}</span>
                  <span className="mt-1 block text-[13px] opacity-70">{item.description}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </PublicVenueListShell>
  );
}
