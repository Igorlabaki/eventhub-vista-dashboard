import { AverageMonthData, TrafficSource } from "@/types/venue";

export const REPORT_MONTHS = [
  "jan.", "fev.", "mar.", "abr.", "mai.", "jun.",
  "jul.", "ago.", "set.", "out.", "nov.", "dez.",
] as const;

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export const TRAFFIC_SOURCES = [
  { name: "Instagram", key: "instagram", color: "#E94F4A", social: true },
  { name: "TikTok", key: "tikTok", color: "#3ED6C5", social: true },
  { name: "Outros", key: "other", color: "#3A6DF0", social: false },
  { name: "Google", key: "google", color: "#A259F7", social: false },
  { name: "Amigos", key: "friend", color: "#FFD600", social: false },
  { name: "Airbnb", key: "airbnb", color: "#F75C9C", social: false },
  { name: "Facebook", key: "facebook", color: "#3B5998", social: true },
] as const;

export type ReportKind = "orcamentos" | "eventos";
export type DeltaTone = "up" | "down" | "flat" | "none";

export interface YearTotals {
  count: number;
  amount: number;
  guests: number;
  approved: number;
  proposals: number;
}

export interface MonthRow {
  month: string;
  count: number;
  total: number;
  guestNumber: number;
}

export interface PreviousMonths {
  count: number[];
  approved: number[];
  proposals: number[];
}

export interface AverageMonths {
  count: number[];
  rate: number[];
}

export interface ReportInput {
  kind: ReportKind;
  year: string;
  previousYear: string;
  current: YearTotals;
  previous: YearTotals | null;
  countMonths: number[];
  amountMonths: number[];
  guestMonths: number[];
  approvedMonths: number[];
  proposalMonths: number[];
  traffic: TrafficSource[];
  previousMonths?: PreviousMonths | null;
  averageMonths?: AverageMonths | null;
}

export interface ReportDelta {
  text: string | null;
  tone: DeltaTone;
  aria: string;
}

export interface ReportModel {
  kpis: Array<{
    key: "count" | "conversion" | "ticket" | "people";
    label: string;
    value: string;
    spark: number[];
    color: string;
    delta: ReportDelta;
  }>;
  chartTitle: string;
  chartSubtitle: string;
  quantityToggle: string;
  leadsSubtitle: string;
  insightsSubtitle: string;
  quantitySeries: number[];
  conversionSeries: number[];
  previousLabel: string;
  previousQuantitySeries: number[] | null;
  previousConversionSeries: number[] | null;
  averageQuantitySeries: number[] | null;
  averageConversionSeries: number[] | null;
  traffic: Array<{ name: string; value: number; percent: number; color: string }>;
  bestMonth: string | null;
  participationLabel: string;
  participation: string | null;
  topChannel: string | null;
  socialLeader: string | null;
}

export function alignMonths(rows: MonthRow[] | undefined, pick: "count" | "total" | "guestNumber"): number[] {
  return REPORT_MONTHS.map((name) => {
    const found = rows?.find((row) => row.month === name);
    return found ? found[pick] || 0 : 0;
  });
}

/** `null` quando a rota nao trouxe media (sem anos com receita ou sem `average=true`). */
export function averageMonths(
  points: AverageMonthData[] | undefined,
  countKey: "proposals" | "approved",
): AverageMonths | null {
  if (!points || points.length === 0) return null;
  const pick = (key: "proposals" | "approved" | "rate") => REPORT_MONTHS.map((name) => {
    const found = points.find((point) => point.month === name);
    return found ? found[key] || 0 : 0;
  });
  return { count: pick(countKey), rate: pick("rate") };
}

function pad(values: number[]): number[] {
  return REPORT_MONTHS.map((_, index) => values[index] || 0);
}

function rate(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return (part / whole) * 100;
}

function percentDelta(current: number, previous: number | null): number | null {
  if (previous === null || previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function toneOf(value: number | null): DeltaTone {
  if (value === null) return "none";
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "flat";
}

function percentText(value: number | null, previousYear: string, phrase: "full" | "short"): ReportDelta {
  if (value === null) {
    return { text: null, tone: "none", aria: "sem comparação com o ano anterior" };
  }
  const visible = `${value > 0 ? "+" : ""}${value}%`;
  const suffix = phrase === "full" ? `em relação a ${previousYear}` : `vs. ${previousYear}`;
  return { text: `${visible} ${suffix}`, tone: toneOf(value), aria: `${visible} ${suffix}` };
}

function pointsText(value: number | null, previousYear: string): ReportDelta {
  if (value === null) {
    return { text: null, tone: "none", aria: "sem comparação com o ano anterior" };
  }
  const number = Math.abs(value).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  const text = `${sign}${number} p.p. vs. ${previousYear}`;
  return { text, tone: toneOf(value), aria: text };
}

function money(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function rawAverage(part: number, count: number): number {
  if (count <= 0) return 0;
  return part / count;
}

export function buildReportModel(input: ReportInput): ReportModel {
  const countMonths = pad(input.countMonths);
  const amountMonths = pad(input.amountMonths);
  const guestMonths = pad(input.guestMonths);
  const approvedMonths = pad(input.approvedMonths);
  const proposalMonths = pad(input.proposalMonths);
  const noun = input.kind === "orcamentos" ? "orçamentos" : "eventos";
  const currentRate = rate(input.current.approved, input.current.proposals);
  const previousRate = input.previous ? rate(input.previous.approved, input.previous.proposals) : 0;
  const points = input.previous && input.previous.proposals > 0
    ? Math.round((currentRate - previousRate) * 10) / 10
    : null;
  const currentPeople = rawAverage(input.current.guests, input.current.count);
  const previousPeople = input.previous ? rawAverage(input.previous.guests, input.previous.count) : null;
  const currentTicket = rawAverage(input.current.amount, input.current.count);
  const previousTicket = input.previous ? rawAverage(input.previous.amount, input.previous.count) : null;

  const totalClicks = input.traffic.reduce((sum, source) => {
    const known = TRAFFIC_SOURCES.some((item) => item.key.toLowerCase() === source.name.toLowerCase());
    return known ? sum + source.count : sum;
  }, 0);
  const traffic = TRAFFIC_SOURCES.map((source) => {
    const found = input.traffic.find((item) => item.name.toLowerCase() === source.key.toLowerCase());
    const value = found?.count || 0;
    const percent = totalClicks > 0 ? Math.round((value / totalClicks) * 100) : 0;
    return { name: source.name, value, percent, color: source.color, social: source.social };
  }).sort((a, b) => b.value - a.value);

  const monthTotal = countMonths.reduce((sum, value) => sum + value, 0);
  let bestIndex = -1;
  countMonths.forEach((value, index) => {
    if (value > 0 && (bestIndex === -1 || value >= countMonths[bestIndex])) bestIndex = index;
  });

  const top = traffic.find((item) => item.value > 0) ?? null;
  const social = [...traffic].filter((item) => item.social && item.value > 0).sort((a, b) => b.value - a.value)[0] ?? null;

  let previousConversion: number[] | null = null;
  if (input.previousMonths) {
    const previousApproved = pad(input.previousMonths.approved);
    previousConversion = pad(input.previousMonths.proposals).map((proposals, index) => rate(previousApproved[index], proposals));
  }

  return {
    kpis: [
      {
        key: "count",
        label: input.kind === "orcamentos" ? "Total de orçamentos" : "Total de eventos",
        value: String(input.current.count),
        spark: countMonths,
        color: "#7c3aed",
        delta: percentText(percentDelta(input.current.count, input.previous ? input.previous.count : null), input.previousYear, "full"),
      },
      {
        key: "conversion",
        label: "Taxa de conversão",
        value: `${currentRate.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
        spark: proposalMonths.map((proposals, index) => rate(approvedMonths[index], proposals)),
        color: "#059669",
        delta: pointsText(points, input.previousYear),
      },
      {
        key: "ticket",
        label: "Ticket médio",
        value: money(currentTicket),
        spark: countMonths.map((count, index) => rawAverage(amountMonths[index], count)),
        color: "#7c3aed",
        delta: percentText(percentDelta(currentTicket, previousTicket), input.previousYear, "short"),
      },
      {
        key: "people",
        label: "Pessoas em média",
        value: String(Math.round(currentPeople)),
        spark: countMonths.map((count, index) => (count > 0 ? guestMonths[index] / count : 0)),
        color: "#7c3aed",
        delta: percentText(percentDelta(currentPeople, previousPeople), input.previousYear, "short"),
      },
    ],
    chartTitle: input.kind === "orcamentos" ? "Orçamentos por mês" : "Eventos por mês",
    chartSubtitle: `Evolução mensal de ${noun} em ${input.year}`,
    quantityToggle: input.kind === "orcamentos" ? "Orçamentos" : "Eventos",
    leadsSubtitle: `Canais de entrada dos ${noun}`,
    insightsSubtitle: `Destaques de ${input.year}`,
    quantitySeries: countMonths,
    conversionSeries: proposalMonths.map((proposals, index) => rate(approvedMonths[index], proposals)),
    previousLabel: input.previousYear,
    previousQuantitySeries: input.previousMonths ? pad(input.previousMonths.count) : null,
    previousConversionSeries: previousConversion,
    averageQuantitySeries: input.averageMonths ? pad(input.averageMonths.count) : null,
    averageConversionSeries: input.averageMonths ? pad(input.averageMonths.rate) : null,
    traffic: traffic.map(({ name, value, percent, color }) => ({ name, value, percent, color })),
    bestMonth: bestIndex >= 0 ? MONTH_NAMES[bestIndex] : null,
    participationLabel: bestIndex >= 0 ? `Participação de ${MONTH_NAMES[bestIndex].toLowerCase()}` : "Participação do mês",
    participation: bestIndex >= 0 && monthTotal > 0 ? `${Math.round((countMonths[bestIndex] / monthTotal) * 100)}%` : null,
    topChannel: top ? `${top.name} (${top.percent}%)` : null,
    socialLeader: social ? social.name : null,
  };
}
