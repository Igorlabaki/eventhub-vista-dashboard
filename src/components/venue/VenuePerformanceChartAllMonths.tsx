import { VenueDashboardData } from "@/types/venue";
import { Goal } from "@/types/goal";
import { annualPerformancePoints, VenuePerformanceSeries } from "./VenuePerformanceSeries";

interface Props {
  data: VenueDashboardData;
  goals: Goal[];
}

export function VenuePerformanceChartAllMonths({ data, goals }: Props) {
  return <VenuePerformanceSeries points={annualPerformancePoints(data, goals)} />;
}
