import { useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useVenueReportsStore } from "@/store/venueReportsStore";
import { ReportsChartCard } from "./ReportsChartCard";

interface EventsReportProps {
  selectedYear: string;
}

export function EventsReport({ selectedYear }: EventsReportProps) {
  const { id: venueId } = useParams<{ id: string }>();
  const { monthlyEventsData, trafficEventsData, fetchEventsData, fetchEventsTraffic, monthlyBudgetsData, fetchBudgetsData } = useVenueReportsStore();

  const fetchData = useCallback(async () => {
    if (!venueId) return;
    await fetchEventsData({ venueId, year: selectedYear, approved: true });
    await fetchEventsTraffic({ venueId, year: selectedYear, approved: true });
    await fetchBudgetsData({ venueId, year: selectedYear, approved: false });
  }, [venueId, selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <ReportsChartCard
      title={`EVENTOS ${selectedYear}`}
      total={monthlyEventsData.total}
      monthsData={monthlyEventsData.analysisEventsByMonth}
      trafficData={trafficEventsData.sortedSources}
      type="eventos"
      approvedCount={monthlyEventsData.total.count}
      orcamentosCount={monthlyBudgetsData.total.count}
    />
  );
} 