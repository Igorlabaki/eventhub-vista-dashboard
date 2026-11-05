import { REPORT_MONTHS } from "./report-metrics";

export type FinanceTone = "up" | "down" | "flat" | "none";

export interface FinanceDelta {
  text: string | null;
  tone: FinanceTone;
  aria: string;
}

export interface FinanceItem {
  name: string;
  value: number;
}

export interface FinanceInput {
  year: string;
  previousYear: string;
  revenue: number;
  revenueMonths: number[];
  recurringMonthly: number;
  recurringAnnual: number;
  sporadicTotal: number;
  composition: FinanceItem[];
  previous: { revenue: number; expenses: number } | null;
}

export interface FinanceModel {
  kpis: Array<{
    key: "revenue" | "expenses" | "net" | "margin";
    label: string;
    value: string;
    spark: number[];
    color: string;
    delta: FinanceDelta;
  }>;
  chartTitle: string;
  chartSubtitle: string;
  marginSubtitle: string;
  compositionSubtitle: string;
  insightsSubtitle: string;
  revenueMonths: number[];
  expenseMonths: number[];
  marginMonths: number[];
  composition: Array<{ name: string; value: number; percent: number; color: string }>;
  compositionEmpty: boolean;
  largest: string | null;
  monthlyExpense: string;
  sporadicExpense: string;
  marginLabel: string;
}

const COLORS = ["#7c3aed", "#059669", "#d97706", "#0284c7", "#db2777", "#4f46e5", "#0f766e"];

function pad(values: number[]): number[] {
  return REPORT_MONTHS.map((_, index) => values[index] || 0);
}

function money(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function percentDelta(current: number, previous: number | null): number | null {
  if (previous === null || previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function toneOf(value: number | null): FinanceTone {
  if (value === null) return "none";
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "flat";
}

function percentText(value: number | null, previousYear: string, phrase: "full" | "short"): FinanceDelta {
  if (value === null) {
    return { text: null, tone: "none", aria: "sem comparação com o ano anterior" };
  }
  const visible = `${value > 0 ? "+" : ""}${value}%`;
  const suffix = phrase === "full" ? `em relação a ${previousYear}` : `vs. ${previousYear}`;
  return { text: `${visible} ${suffix}`, tone: toneOf(value), aria: `${visible} ${suffix}` };
}

function pointsText(value: number | null, previousYear: string): FinanceDelta {
  if (value === null) {
    return { text: null, tone: "none", aria: "sem comparação com o ano anterior" };
  }
  const number = Math.abs(value).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  const text = `${sign}${number} p.p. vs. ${previousYear}`;
  return { text, tone: toneOf(value), aria: text };
}

function marginOf(revenue: number, expenses: number): number | null {
  if (revenue <= 0) return null;
  return ((revenue - expenses) / revenue) * 100;
}

function marginLabel(value: number | null): string {
  if (value === null) return "—";
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

export function buildFinanceModel(input: FinanceInput): FinanceModel {
  const revenueMonths = pad(input.revenueMonths);
  const recurringMonthly = input.recurringMonthly || 0;
  const expenseMonths = REPORT_MONTHS.map(() => recurringMonthly);
  const marginMonths = revenueMonths.map((revenue) => {
    if (revenue <= 0) return 0;
    return ((revenue - recurringMonthly) / revenue) * 100;
  });
  const expenses = (input.recurringAnnual || 0) + (input.sporadicTotal || 0);
  const net = input.revenue - expenses;
  const margin = marginOf(input.revenue, expenses);
  const previousMargin = input.previous ? marginOf(input.previous.revenue, input.previous.expenses) : null;
  const points = margin !== null && previousMargin !== null
    ? Math.round((margin - previousMargin) * 10) / 10
    : null;
  const previousNet = input.previous ? input.previous.revenue - input.previous.expenses : null;

  const composition = [...input.composition]
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .map((item, index) => ({
      name: item.name,
      value: item.value,
      percent: expenses > 0 ? Math.round((item.value / expenses) * 100) : 0,
      color: COLORS[index % COLORS.length],
    }));

  const largest = composition[0] ? `${composition[0].name} (${composition[0].percent}%)` : null;

  return {
    kpis: [
      {
        key: "revenue",
        label: "Receita bruta",
        value: money(input.revenue),
        spark: revenueMonths,
        color: "#7c3aed",
        delta: percentText(percentDelta(input.revenue, input.previous ? input.previous.revenue : null), input.previousYear, "full"),
      },
      {
        key: "expenses",
        label: "Despesas totais",
        value: money(expenses),
        spark: expenseMonths,
        color: "#7c3aed",
        delta: percentText(percentDelta(expenses, input.previous ? input.previous.expenses : null), input.previousYear, "short"),
      },
      {
        key: "net",
        label: "Receita líquida",
        value: money(net),
        spark: revenueMonths.map((revenue) => revenue - recurringMonthly),
        color: "#7c3aed",
        delta: percentText(percentDelta(net, previousNet), input.previousYear, "short"),
      },
      {
        key: "margin",
        label: "Margem líquida",
        value: marginLabel(margin),
        spark: marginMonths,
        color: "#059669",
        delta: pointsText(points, input.previousYear),
      },
    ],
    chartTitle: "Receita x despesa",
    chartSubtitle: `Receita e despesa recorrente em ${input.year}`,
    marginSubtitle: `Margem mensal sobre a receita em ${input.year}`,
    compositionSubtitle: `Despesas de ${input.year}`,
    insightsSubtitle: `Destaques de ${input.year}`,
    revenueMonths,
    expenseMonths,
    marginMonths,
    composition,
    compositionEmpty: composition.length === 0,
    largest,
    monthlyExpense: money(recurringMonthly),
    sporadicExpense: money(input.sporadicTotal || 0),
    marginLabel: marginLabel(margin),
  };
}
