import { VenueDashboardData } from "@/types/venue";
import { Goal } from "@/types/goal";
import { annualPerformancePoints, monthlyPerformancePoints, VenuePerformanceSeries } from "./VenuePerformanceSeries";

interface VenuePerformanceChartProps {
  data: VenueDashboardData;
  goals: Goal[];
  selectedMonth: number | "all";
}

export function VenuePerformanceChart({ data, goals, selectedMonth }: VenuePerformanceChartProps) {
  const points = selectedMonth === "all"
    ? annualPerformancePoints(data, goals)
    : monthlyPerformancePoints(data, goals, selectedMonth);

  return <VenuePerformanceSeries points={points} />;
}
