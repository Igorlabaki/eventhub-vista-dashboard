import { TRAFFIC_SOURCES } from "@/components/reports/report-metrics";
import { ExpenseCategory, ExpenseTrafficSource } from "@/types/expense";

export const EXPENSE_TRAFFIC_SOURCES: ExpenseTrafficSource[] = ["INSTAGRAM", "FACEBOOK", "TIKTOK", "GOOGLE", "OTHER"];

export function trafficSourceLabel(source: string): string {
  return TRAFFIC_SOURCES.find((item) => item.key.toLowerCase() === source.toLowerCase())?.name ?? source;
}

export const expenseTrafficSourceOptions = EXPENSE_TRAFFIC_SOURCES.map((value) => ({
  value,
  display: trafficSourceLabel(value),
}));

/** Canal enviado ao backend: so Publicidade carrega canal; as demais categorias mandam `null`. */
export function expenseTrafficSourcePayload(
  category: ExpenseCategory,
  trafficSource: ExpenseTrafficSource | "" | null | undefined,
): ExpenseTrafficSource | null {
  if (category !== ExpenseCategory.ADVERTISING) return null;
  return trafficSource || null;
}

/** Rotulo do canal na lista, so para despesa de Publicidade com canal. */
export function expenseChannelLabel(expense: { category: ExpenseCategory; trafficSource?: ExpenseTrafficSource | null }): string | null {
  if (expense.category !== ExpenseCategory.ADVERTISING || !expense.trafficSource) return null;
  return trafficSourceLabel(expense.trafficSource);
}
