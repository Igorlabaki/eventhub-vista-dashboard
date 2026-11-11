import { EVENT_CATEGORY_OPTIONS } from "@/lib/event-category";
import {
  EventProfileData,
  GuestBucketKey,
  LeadTimeBucketKey,
  OccupancyCell,
  OccupancyData,
  OccupancyKey,
  ReportEventCategoryFilter,
} from "@/types/venue";
import { UNCATEGORIZED_LABEL } from "./report-metrics";

export const UNAVAILABLE_LABEL = "indisponível";
export const EMPTY_BLOCK_LABEL = "Nenhum registro neste periodo.";
export const FULL_YEAR_LABEL = "Ano inteiro";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

export function formatDecimal(value: number): string {
  return decimal.format(value);
}

export function formatHours(minutes: number): string {
  return `${formatDecimal(minutes / 60)} h`;
}

/** Fracao 0–1 vinda do backend; `null` = sem base para a taxa. */
export function formatRate(rate: number | null | undefined): string {
  if (rate === null || rate === undefined || !Number.isFinite(rate)) return UNAVAILABLE_LABEL;
  return `${formatDecimal(rate * 100)}%`;
}

export function formatDays(days: number | null): string {
  if (days === null) return UNAVAILABLE_LABEL;
  return `${formatDecimal(days)} ${days === 1 ? "dia" : "dias"}`;
}

export function monthOptionLabel(month: number): string {
  return MONTH_NAMES[month - 1] ?? String(month);
}

export function periodLabel(period: { year: number; month: number | null }): string {
  if (period.month === null) return FULL_YEAR_LABEL;
  return `${monthOptionLabel(period.month)} de ${period.year}`;
}

export function coverageLabel(linesWithAmount: number, linesTotal: number): string {
  if (linesWithAmount === 0) return "sem valor registrado";
  return `valor registrado em ${linesWithAmount} de ${linesTotal} ${linesTotal === 1 ? "linha" : "linhas"}`;
}

export function blockErrorMessage(error: unknown): string {
  const status = (error as { response?: { status?: number } } | null)?.response?.status;
  if (status === 403) return "Você não tem permissão para ver as análises deste espaço.";
  return "Não foi possível carregar este bloco.";
}

export function categoryLabel(key: string | null): string {
  if (key === null) return UNCATEGORIZED_LABEL;
  return EVENT_CATEGORY_OPTIONS.find((option) => option.value === key)?.label ?? key;
}

export const ALL_CATEGORIES = "ALL";
export type CategoryFilterValue = ReportEventCategoryFilter | typeof ALL_CATEGORIES;

export const CATEGORY_FILTER_OPTIONS: { value: CategoryFilterValue; label: string }[] = [
  { value: ALL_CATEGORIES, label: "Todas as categorias" },
  ...EVENT_CATEGORY_OPTIONS.map((option) => ({ value: option.value as ReportEventCategoryFilter, label: option.label })),
  { value: "NONE", label: UNCATEGORIZED_LABEL },
];

export function categoryFilterParam(value: CategoryFilterValue): ReportEventCategoryFilter | undefined {
  return value === ALL_CATEGORIES ? undefined : value;
}

export const LEAD_TIME_LABELS: Record<LeadTimeBucketKey, string> = {
  "0-7": "0–7 dias",
  "8-30": "8–30 dias",
  "31-90": "31–90 dias",
  "90+": "mais de 90 dias",
};

export const GUEST_BUCKET_LABELS: Record<GuestBucketKey, string> = {
  "0-50": "até 50",
  "51-100": "51–100",
  "101-150": "101–150",
  "151+": "151 ou mais",
};

export const OCCUPANCY_VIEWS: { key: OccupancyKey; label: string }[] = [
  { key: "total", label: "Todos" },
  { key: "events", label: "Eventos" },
  { key: "visits", label: "Visitas" },
  { key: "blocks", label: "Bloqueios" },
];

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const WEEKDAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
/** Segunda primeiro, domingo por ultimo. */
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function bandLabel(band: number, bandHours = 2): string {
  const pad = (hour: number) => String(hour).padStart(2, "0");
  return `${pad(band * bandHours)}–${pad((band + 1) * bandHours)}`;
}

export interface OccupancyGridRow {
  weekday: number;
  label: string;
  name: string;
  cells: { band: number; minutes: number; intensity: number }[];
}

/** Linhas de segunda a domingo; intensidade 0–1 relativa a maior celula do grupo escolhido. */
export function occupancyGrid(cells: OccupancyCell[], key: OccupancyKey, bandHours = 2): OccupancyGridRow[] {
  const bands = Math.round(24 / bandHours);
  const max = cells.reduce((acc, cell) => Math.max(acc, cell[key]), 0);
  return WEEKDAY_ORDER.map((weekday) => ({
    weekday,
    label: WEEKDAY_LABELS[weekday],
    name: WEEKDAY_NAMES[weekday],
    cells: Array.from({ length: bands }, (_, band) => {
      const minutes = cells.find((cell) => cell.weekday === weekday && cell.band === band)?.[key] ?? 0;
      return { band, minutes, intensity: max > 0 ? minutes / max : 0 };
    }),
  }));
}

export function occupancySummary(data: OccupancyData, key: OccupancyKey) {
  return {
    hours: formatHours(data.totals[key]),
    days: data.daysWithRecords[key],
    period: periodLabel(data.period),
    empty: data.totals.total === 0,
  };
}

export interface CapacityIndicator {
  available: boolean;
  atLeast80: string;
  above100: string;
  detail: string;
}

export function capacityIndicator(capacity: EventProfileData["capacity"]): CapacityIndicator {
  if (!capacity) {
    return {
      available: false,
      atLeast80: UNAVAILABLE_LABEL,
      above100: UNAVAILABLE_LABEL,
      detail: "Capacidade máxima do espaço não cadastrada.",
    };
  }
  return {
    available: true,
    atLeast80: formatRate(capacity.atLeast80Rate),
    above100: formatRate(capacity.above100Rate),
    detail: `${capacity.atLeast80} com 80% ou mais e ${capacity.above100} acima de ${capacity.maxGuest} convidados`,
  };
}
