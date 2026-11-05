import { useEffect, useState } from "react";
import { expenseService } from "@/services/expenseService";
import { ExpenseAnalysis } from "@/types/expense";
import { VenueReportsSkeleton } from "./VenueReportsSkeleton";
import { useAnalysisYear } from "./useAnalysisYear";
import { alignMonths } from "./report-metrics";
import { FinancialReportCard } from "./FinancialReportCard";
import { FinanceInput } from "./finance-metrics";

function useExpenseYear(venueId: string, year: string) {
  const [data, setData] = useState<ExpenseAnalysis | null>(null);

  useEffect(() => {
    if (!venueId || !year) return;
    let active = true;
    setData(null);
    expenseService.analysis({ venueId, year })
      .then((response) => {
        if (active) setData(response.data);
      })
      .catch(() => {
        if (active) setData(null);
      });
    return () => {
      active = false;
    };
  }, [venueId, year]);

  return data;
}

export function FinancialBalanceReport({
  selectedYear,
  venueId,
}: {
  selectedYear: string;
  venueId: string;
}) {
  const previousYear = String(Number(selectedYear) - 1);
  const currentEvents = useAnalysisYear(venueId, selectedYear, true);
  const previousEvents = useAnalysisYear(venueId, previousYear, true);
  const currentExpenses = useExpenseYear(venueId, selectedYear);
  const previousExpenses = useExpenseYear(venueId, previousYear);

  if (!currentEvents || !currentExpenses) {
    return <VenueReportsSkeleton />;
  }

  const input: FinanceInput = {
    year: selectedYear,
    previousYear,
    revenue: currentEvents.approved?.total || 0,
    revenueMonths: alignMonths(currentEvents.analysisEventsByMonth, "total"),
    recurringMonthly: currentExpenses.total.monthly || 0,
    recurringAnnual: currentExpenses.total.annual || 0,
    sporadicTotal: currentExpenses.total.esporadic || 0,
    composition: [
      ...currentExpenses.recurring
        .filter((item) => item.annual > 0)
        .map((item) => ({ name: item.name, value: item.annual })),
      ...currentExpenses.esporadic
        .filter((item) => item.total > 0)
        .map((item) => ({ name: item.name, value: item.total })),
    ],
    previous: previousEvents && previousExpenses
      ? {
          revenue: previousEvents.approved?.total || 0,
          expenses: (previousExpenses.total.annual || 0) + (previousExpenses.total.esporadic || 0),
        }
      : null,
  };

  return <FinancialReportCard input={input} />;
}
