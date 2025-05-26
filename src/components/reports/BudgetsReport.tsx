import { useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useVenueReportsStore } from "@/store/venueReportsStore";
import { ReportsChartCard } from "./ReportsChartCard";

interface BudgetsReportProps {
  selectedYear: string;
}

export function BudgetsReport({ selectedYear }: BudgetsReportProps) {
  const { id: venueId } = useParams<{ id: string }>();
  const { monthlyBudgetsData, trafficBudgetsData, fetchBudgetsData, fetchBudgetsTraffic, monthlyEventsData, fetchEventsData } = useVenueReportsStore();

  console.log("BudgetsReport render", { venueId, selectedYear });

  const fetchData = useCallback(async () => {
    if (!venueId) return;
    console.log("BudgetsReport useEffect", { venueId, selectedYear });
    await fetchBudgetsData({ venueId, year: selectedYear, approved: false });
    await fetchBudgetsTraffic({ venueId, year: selectedYear, approved: false });
    await fetchEventsData({ venueId, year: selectedYear, approved: true });
  }, [venueId, selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  console.log("BudgetsReport data", { monthlyBudgetsData, trafficBudgetsData });

  return (
    <ReportsChartCard
      title={`ORÇAMENTOS ${selectedYear}`}
      total={monthlyBudgetsData.total}
      monthsData={monthlyBudgetsData.analysisProposalByMonth}
      trafficData={trafficBudgetsData.sortedSources}
      type="orçamentos"
      approvedCount={monthlyEventsData.total.count}
    />
  );
} 