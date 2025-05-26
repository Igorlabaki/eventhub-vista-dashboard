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

  console.log("EventsReport render", { venueId, selectedYear });

  const fetchData = useCallback(async () => {
    if (!venueId) return;
    console.log("EventsReport useEffect", { venueId, selectedYear });
    await fetchEventsData({ venueId, year: selectedYear, approved: true });
    await fetchEventsTraffic({ venueId, year: selectedYear, approved: true });
    await fetchBudgetsData({ venueId, year: selectedYear, approved: false });
  }, [venueId, selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  console.log("EventsReport data", { monthlyEventsData, trafficEventsData });

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