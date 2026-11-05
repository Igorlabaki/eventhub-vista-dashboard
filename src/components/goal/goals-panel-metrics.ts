export const EMPTY_PANEL_LABEL = "Nada configurado";

export type PanelBlockState = "loading" | "error" | "empty" | "ready";

const PRICING_MODELS = {
  PER_PERSON: { label: "Preço por Pessoa", field: "pricePerPerson" },
  PER_DAY: { label: "Preço por Diária", field: "pricePerDay" },
  PER_PERSON_DAY: { label: "Preço por Pessoa por Dia", field: "pricePerPersonDay" },
  PER_PERSON_HOUR: { label: "Preço por Pessoa por Hora", field: "pricePerPersonHour" },
} as const;

type PricingModelKey = keyof typeof PRICING_MODELS;

export interface PanelPriceSource {
  pricingModel?: string | null;
  pricePerPerson?: number | null;
  pricePerDay?: number | null;
  pricePerPersonDay?: number | null;
  pricePerPersonHour?: number | null;
}

export interface PanelGoalAmount {
  minValue: number;
  months: string;
}

export function validMonthNumbers(months: string | null | undefined): number[] {
  if (!months) return [];
  const seen = new Set<number>();
  const result: number[] = [];
  for (const part of months.split(",")) {
    const month = Number(part.trim());
    if (!Number.isInteger(month) || month < 1 || month > 12 || seen.has(month)) continue;
    seen.add(month);
    result.push(month);
  }
  return result;
}

export function annualGoalTotal(goals: readonly PanelGoalAmount[]): number | null {
  if (goals.length === 0) return null;
  return goals.reduce((sum, goal) => sum + goal.minValue * validMonthNumbers(goal.months).length, 0);
}

export function resolveCurrentPrice(
  source: PanelPriceSource | null | undefined,
): { label: string; price: number } | null {
  if (!source?.pricingModel || !(source.pricingModel in PRICING_MODELS)) return null;
  const model = PRICING_MODELS[source.pricingModel as PricingModelKey];
  const price = source[model.field];
  if (typeof price !== "number" || !(price > 0)) return null;
  return { label: model.label, price };
}

export function isMinimumConfigured(value: number | null | undefined): boolean {
  return typeof value === "number" && value > 0;
}

export function isCountConfigured(count: number): boolean {
  return count > 0;
}

export function samplePanelItems<T>(items: readonly T[], limit = 3): T[] {
  return items.slice(0, limit);
}

export function panelBlockState(input: {
  isLoading: boolean;
  error?: string | null;
  hasData: boolean;
}): PanelBlockState {
  if (input.isLoading) return "loading";
  if (input.error) return "error";
  if (!input.hasData) return "empty";
  return "ready";
}

export function formatPanelMoney(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
