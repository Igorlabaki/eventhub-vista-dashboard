import { useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useVenueReportsStore } from "@/store/venueReportsStore";
import { ReportsChartCard } from "./ReportsChartCard";
import { LeadTimeCard } from "./LeadTimeCard";
import { alignMonths, averageMonths, ReportInput } from "./report-metrics";
import { useAnalysisYear } from "./useAnalysisYear";

interface BudgetsReportProps {
  selectedYear: string;
}

export function BudgetsReport({ selectedYear }: BudgetsReportProps) {
  const { id: venueId } = useParams<{ id: string }>();
  const { monthlyBudgetsData, trafficBudgetsData, fetchBudgetsData, fetchBudgetsTraffic, monthlyEventsData, fetchEventsData } = useVenueReportsStore();
  const previousYear = String(Number(selectedYear) - 1);
  const previous = useAnalysisYear(venueId, previousYear);

  const fetchData = useCallback(async () => {
    if (!venueId) return;
    await fetchBudgetsData({ venueId, year: selectedYear, approved: false });
    await fetchBudgetsTraffic({ venueId, year: selectedYear, approved: false });
    await fetchEventsData({ venueId, year: selectedYear, approved: true });
  }, [venueId, selectedYear, fetchBudgetsData, fetchBudgetsTraffic, fetchEventsData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const input: ReportInput = {
    kind: "orcamentos",
    year: selectedYear,
    previousYear,
    current: {
      count: monthlyBudgetsData.total.count,
      amount: monthlyBudgetsData.total.total,
      guests: monthlyBudgetsData.total.guestNumber,
      approved: monthlyEventsData.total.count,
      proposals: monthlyBudgetsData.total.count,
    },
    previous: previous ? {
      count: previous.total.count,
      amount: previous.total.total,
      guests: previous.total.guestNumber,
      approved: previous.approved.count,
      proposals: previous.total.count,
    } : null,
    countMonths: alignMonths(monthlyBudgetsData.analysisProposalByMonth, "count"),
    amountMonths: alignMonths(monthlyBudgetsData.analysisProposalByMonth, "total"),
    guestMonths: alignMonths(monthlyBudgetsData.analysisProposalByMonth, "guestNumber"),
    approvedMonths: alignMonths(monthlyEventsData.analysisEventsByMonth, "count"),
    proposalMonths: alignMonths(monthlyBudgetsData.analysisProposalByMonth, "count"),
    traffic: trafficBudgetsData.sortedSources,
    categories: trafficBudgetsData.categories,
    previousMonths: previous ? {
      count: alignMonths(previous.analysisProposalByMonth, "count"),
      approved: alignMonths(previous.analysisEventsByMonth, "count"),
      proposals: alignMonths(previous.analysisProposalByMonth, "count"),
    } : null,
    averageMonths: averageMonths(monthlyBudgetsData.averageByMonth, "proposals"),
  };

  return (
    <div className="space-y-4">
      <ReportsChartCard kind="orcamentos" input={input} />
      <LeadTimeCard venueId={venueId} year={Number(selectedYear)} />
    </div>
  );
}
