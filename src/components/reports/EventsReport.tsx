import { useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useVenueReportsStore } from "@/store/venueReportsStore";
import { ReportsChartCard } from "./ReportsChartCard";
import { OccupancyCard } from "./OccupancyCard";
import { ServiceAdherenceCard } from "./ServiceAdherenceCard";
import { EventProfileCard } from "./EventProfileCard";
import { alignMonths, averageMonths, ReportInput } from "./report-metrics";
import { useAnalysisYear } from "./useAnalysisYear";

interface EventsReportProps {
  selectedYear: string;
}

export function EventsReport({ selectedYear }: EventsReportProps) {
  const { id: venueId } = useParams<{ id: string }>();
  const { monthlyEventsData, trafficEventsData, fetchEventsData, fetchEventsTraffic, monthlyBudgetsData, fetchBudgetsData } = useVenueReportsStore();
  const previousYear = String(Number(selectedYear) - 1);
  const previousEvents = useAnalysisYear(venueId, previousYear, true);
  const previousBudgets = useAnalysisYear(venueId, previousYear);

  const fetchData = useCallback(async () => {
    if (!venueId) return;
    await fetchEventsData({ venueId, year: selectedYear, approved: true });
    await fetchEventsTraffic({ venueId, year: selectedYear, approved: true });
    await fetchBudgetsData({ venueId, year: selectedYear, approved: false });
  }, [venueId, selectedYear, fetchEventsData, fetchEventsTraffic, fetchBudgetsData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const input: ReportInput = {
    kind: "eventos",
    year: selectedYear,
    previousYear,
    current: {
      count: monthlyEventsData.total.count,
      amount: monthlyEventsData.total.total,
      guests: monthlyEventsData.total.guestNumber,
      approved: monthlyEventsData.total.count,
      proposals: monthlyBudgetsData.total.count,
    },
    previous: previousEvents && previousBudgets ? {
      count: previousEvents.total.count,
      amount: previousEvents.total.total,
      guests: previousEvents.total.guestNumber,
      approved: previousEvents.total.count,
      proposals: previousBudgets.total.count,
    } : null,
    countMonths: alignMonths(monthlyEventsData.analysisEventsByMonth, "count"),
    amountMonths: alignMonths(monthlyEventsData.analysisEventsByMonth, "total"),
    guestMonths: alignMonths(monthlyEventsData.analysisEventsByMonth, "guestNumber"),
    approvedMonths: alignMonths(monthlyEventsData.analysisEventsByMonth, "count"),
    proposalMonths: alignMonths(monthlyBudgetsData.analysisProposalByMonth, "count"),
    traffic: trafficEventsData.sortedSources,
    categories: trafficEventsData.categories,
    previousMonths: previousEvents && previousBudgets ? {
      count: alignMonths(previousEvents.analysisEventsByMonth, "count"),
      approved: alignMonths(previousEvents.analysisEventsByMonth, "count"),
      proposals: alignMonths(previousBudgets.analysisProposalByMonth, "count"),
    } : null,
    averageMonths: averageMonths(monthlyBudgetsData.averageByMonth, "approved"),
  };

  const year = Number(selectedYear);

  return (
    <div className="space-y-4">
      <ReportsChartCard kind="eventos" input={input} />
      <OccupancyCard venueId={venueId} year={year} />
      <div className="grid gap-4 lg:grid-cols-2">
        <ServiceAdherenceCard venueId={venueId} year={year} />
        <EventProfileCard venueId={venueId} year={year} />
      </div>
    </div>
  );
}
