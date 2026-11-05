import { VenueDashboardData } from "@/types/venue";
import { Goal } from "@/types/goal";
import { annualPerformancePoints, monthlyPerformancePoints, trendPerformancePoints, VenuePerformanceSeries } from "./VenuePerformanceSeries";

interface VenuePerformanceChartProps {
  data: VenueDashboardData;
  goals: Goal[];
  selectedMonth: number | "all";
}

export function VenuePerformanceChart({ data, goals, selectedMonth }: VenuePerformanceChartProps) {
  if (selectedMonth === "all") {
    return <VenuePerformanceSeries points={annualPerformancePoints(data, goals)} />;
  }

  const trend = trendPerformancePoints(data);
  if (trend === null) {
    return <VenuePerformanceSeries points={monthlyPerformancePoints(data, goals, selectedMonth)} />;
  }
  if (trend.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">Sem anos com registro</p>;
  }
  return <VenuePerformanceSeries points={trend} variant="trend" />;
}
