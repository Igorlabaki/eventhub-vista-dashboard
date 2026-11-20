import { wallClockDateBr, wallClockDateIso, wallClockTime, wallClockToCalendarDate } from "@/lib/wall-clock-datetime";
import { proposalClientPath, proposalClientUrl, type ProposalClientLink } from "@/lib/proposal-public-url";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export type EventLinkSummary = {
  dayLabel: string | null;
  timeLabel: string | null;
  guestLabel: string | null;
};

export type CountdownParts = {
  days: string;
  hours: string;
  minutes: string;
};

export type EventCountdown =
  | { kind: "hidden" }
  | { kind: "countdown"; phrase: string; parts: CountdownParts }
  | { kind: "started"; phrase: string }
  | { kind: "ended"; phrase: string };

export type EventLinkIcon = "budget" | "partners" | "schedule" | "guests" | "staff" | "rules";

export type EventLinkDestination = {
  label: string;
  description: string;
  icon: EventLinkIcon;
  href: string;
};

function isWallClock(value: unknown): value is string | Date {
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  if (typeof value !== "string") return false;
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value);
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function countdownParts(remainingMs: number): CountdownParts {
  const days = Math.floor(remainingMs / DAY);
  const hours = Math.floor((remainingMs % DAY) / HOUR);
  const minutes = Math.floor((remainingMs % HOUR) / MINUTE);
  return { days: pad(days), hours: pad(hours), minutes: pad(minutes) };
}

function clockLabel(value: string) {
  const [hour, minute] = value.split(":");
  const hourLabel = String(Number(hour));
  return minute === "00" ? `${hourLabel}h` : `${hourLabel}h${minute}`;
}

export function eventLinkSummary(source: {
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  guestNumber?: number | string | null;
}): EventLinkSummary {
  const start = source.startDate;
  const end = source.endDate;
  const hasStart = isWallClock(start);
  const hasEnd = isWallClock(end);
  return {
    dayLabel: !hasStart
      ? null
      : hasEnd && wallClockDateIso(start) !== wallClockDateIso(end)
        ? `${wallClockDateBr(start)} até ${wallClockDateBr(end)}`
        : wallClockDateBr(start),
    timeLabel: !hasStart
      ? null
      : hasEnd
        ? `${clockLabel(wallClockTime(start))} às ${clockLabel(wallClockTime(end))}`
        : clockLabel(wallClockTime(start)),
    guestLabel: guestLabel(source.guestNumber),
  };
}

export function eventCountdown(
  start: string | Date | null | undefined,
  end: string | Date | null | undefined,
  now: Date
): EventCountdown {
  if (!isWallClock(start)) return { kind: "hidden" };
  const nowMs = now.getTime();
  const startMs = wallClockToCalendarDate(start).getTime();
  if (nowMs < startMs) {
    return {
      kind: "countdown",
      phrase: "Seu evento está chegando",
      parts: countdownParts(startMs - nowMs),
    };
  }
  if (isWallClock(end) && nowMs >= wallClockToCalendarDate(end).getTime()) {
    return { kind: "ended", phrase: "O evento já aconteceu." };
  }
  return { kind: "started", phrase: "O evento já começou." };
}

export function proposalEventLinksUrl(link: ProposalClientLink) {
  return proposalClientUrl(link, "evento");
}

export function eventLinkDestinations(link: ProposalClientLink, venueId?: string | null): EventLinkDestination[] {
  const links: EventLinkDestination[] = [
    { label: "Orçamento", description: "Valores e condições", icon: "budget", href: proposalClientPath(link) },
    {
      label: "Parceiros indicados",
      description: "Fornecedores para seu evento",
      icon: "partners",
      href: proposalClientPath(link, "indicacoes"),
    },
    {
      label: "Lista de convidados",
      description: "Gerencie os participantes",
      icon: "guests",
      href: proposalClientPath(link, "convidados"),
    },
    {
      label: "Lista de colaboradores",
      description: "Equipe e fornecedores",
      icon: "staff",
      href: proposalClientPath(link, "colaboradores"),
    },
    {
      label: "Programação",
      description: "Organize os horários",
      icon: "schedule",
      href: proposalClientPath(link, "programacao"),
    },
  ];
  if (!venueId) return links;
  return [
    ...links,
    {
      label: "Regras do espaço",
      description: "O que vale neste espaço",
      icon: "rules",
      href: link.venueName
        ? `/espaco/${encodeURIComponent(link.venueName)}/regras`
        : `/venue/${venueId}/rules/view`,
    },
  ];
}

function guestLabel(value: number | string | null | undefined) {
  if (value == null || value === "") return null;
  const count = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(count) || count < 0) return null;
  const guests = Math.trunc(count);
  return guests === 1 ? "1 pessoa" : `${guests} pessoas`;
}
