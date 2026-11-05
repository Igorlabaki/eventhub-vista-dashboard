import { Bar, CartesianGrid, ComposedChart, LabelList, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { REPORT_MONTHS } from "@/components/reports/report-metrics";
import { VenueDashboardData } from "@/types/venue";
import { Goal } from "@/types/goal";

export interface PerformancePoint {
  name: string;
  Receita: number;
  Meta: number;
}

function money(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function performanceLabel(value: number): string {
  if (!value) return "";
  return value.toLocaleString("pt-BR", { notation: "compact", maximumFractionDigits: 1 });
}

function goalForMonth(goals: Goal[], month: number): number {
  const goal = goals.find((item) =>
    item.months.split(",").map((part) => part.trim()).includes(String(month)),
  );
  return goal?.minValue || 0;
}

function point(month: number, revenue: number, goals: Goal[]): PerformancePoint {
  return {
    name: REPORT_MONTHS[month - 1] ?? String(month),
    Receita: revenue || 0,
    Meta: goalForMonth(goals, month),
  };
}

export function monthlyPerformancePoints(
  data: VenueDashboardData,
  goals: Goal[],
  selectedMonth: number,
): PerformancePoint[] {
  return [point(selectedMonth, data.monthlyRevenue || 0, goals)];
}

export function trendPerformancePoints(data: VenueDashboardData): PerformancePoint[] | null {
  if (data.sameMonthRevenueByYear == null) return null;
  return data.sameMonthRevenueByYear.map((item) => ({
    name: String(item.year),
    Receita: item.revenue || 0,
    Meta: 0,
  }));
}

export function annualPerformancePoints(data: VenueDashboardData, goals: Goal[]): PerformancePoint[] {
  const revenueByMonth = new Map(
    (data.monthlyRevenueList || []).map((item) => [Number(item.month), item.revenue || 0]),
  );
  return REPORT_MONTHS.map((_, index) => point(index + 1, revenueByMonth.get(index + 1) || 0, goals));
}

export function VenuePerformanceSeries({ points, variant = "meta" }: { points: PerformancePoint[]; variant?: "meta" | "trend" }) {
  const max = Math.max(0, ...points.map((item) => Math.max(item.Receita, item.Meta)));
  const lineKey = variant === "trend" ? "Receita" : "Meta";
  const lineName = variant === "trend" ? "Tendência" : "Meta";

  return (
    <div>
      <div className="h-80 w-full" role="img" aria-label={variant === "trend" ? "Receita em barras e tendência em linha" : "Receita em barras e meta em linha"}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={points} margin={{ top: 28, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="venuePerformanceBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#6d5ef5" />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#eef0f6" />
            <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              domain={[0, max === 0 ? 1 : max * 1.25]}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={56}
              tickFormatter={(value: number) => value.toLocaleString("pt-BR", { notation: "compact", maximumFractionDigits: 1 })}
            />
            <Tooltip formatter={(value: number, name: string) => [money(Number(value)), name]} />
            <Bar
              dataKey="Receita"
              name="Receita"
              fill="url(#venuePerformanceBar)"
              radius={[8, 8, 0, 0]}
              maxBarSize={36}
              isAnimationActive={false}
            >
              {variant === "meta" && (
                <LabelList
                  dataKey="Receita"
                  position="top"
                  fill="#5b4cdb"
                  fontSize={12}
                  fontWeight={600}
                  formatter={(value: number) => performanceLabel(value)}
                />
              )}
            </Bar>
            <Line
              type="monotone"
              dataKey={lineKey}
              name={lineName}
              stroke="#6d5ef5"
              strokeWidth={2}
              dot={{ r: 4, fill: "#fff", stroke: "#6d5ef5", strokeWidth: 2 }}
              isAnimationActive={false}
            >
              {variant === "trend" && (
                <LabelList
                  dataKey="Receita"
                  position="top"
                  fill="#5b4cdb"
                  fontSize={12}
                  fontWeight={600}
                  formatter={(value: number) => performanceLabel(value)}
                />
              )}
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center justify-center gap-6 text-xs text-slate-500">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-violet-500" aria-hidden />
          Receita
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-violet-500" aria-hidden />
          {lineName}
        </span>
      </div>
      <ul className="sr-only">
        {points.map((item) => (
          <li key={item.name}>
            {variant === "trend"
              ? `${item.name} receita ${money(item.Receita)}`
              : `${item.name} receita ${money(item.Receita)} meta ${money(item.Meta)}`}
          </li>
        ))}
      </ul>
    </div>
  );
}
