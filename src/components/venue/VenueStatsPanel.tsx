import { ReactNode } from "react";
import { CalendarDays, ClipboardList, CreditCard, Users } from "lucide-react";
import { MonthYearNavigator } from "@/components/proposal/MonthYearNavigator";
import { YearlyChange } from "@/components/ui/yearly-change";
import { VenueDashboardData } from "@/types/venue";
import { NumericFormat } from "react-number-format";

const shortMonthNames = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

interface VenueStatsPanelProps {
  data: VenueDashboardData;
  selectedMonth: string;
  selectedYear: number;
  onMonthChange: (month: string) => void;
  onYearChange: (year: number) => void;
  months: string[];
  numbersLoading?: boolean;
}

function OverviewKpiCard({
  label,
  value,
  icon: Icon,
  iconClass,
  change,
}: {
  label: string;
  value: ReactNode;
  icon: typeof CalendarDays;
  iconClass: string;
  change?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between rounded-2xl border bg-white px-5 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
        </div>
      </div>
      {change}
    </div>
  );
}

export function VenueStatsPanel({
  data,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  numbersLoading = false,
}: VenueStatsPanelProps) {
  const receitaTitulo = selectedMonth === "all" ? "Receita Anual" : "Receita Mensal";
  const receitaValor = selectedMonth === "all"
    ? (data?.monthlyRevenueList?.reduce((acc, curr) => acc + (curr.revenue || 0), 0) || 0)
    : (data?.monthlyRevenue || 0);
  const kpiNumber = (value: ReactNode) =>
    numbersLoading ? (
      <span className="inline-block h-7 w-16 animate-pulse rounded bg-gray-200" />
    ) : (
      value
    );
  const kpiChange = (key: keyof NonNullable<VenueDashboardData["yearlyChange"]>) =>
    numbersLoading ? undefined : <YearlyChange value={data?.yearlyChange?.[key]} />;

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border bg-white p-4 shadow-sm sm:p-5">
        <MonthYearNavigator
          selectedYear={selectedYear}
          selectedMonth={selectedMonth === "all" ? -1 : Number(selectedMonth) - 1}
          monthNames={shortMonthNames}
          onYearChange={onYearChange}
          onMonthChange={(monthIndex) => onMonthChange(String(monthIndex + 1))}
          onSelectAll={() => onMonthChange("all")}
          allSelected={selectedMonth === "all"}
          className="mb-0"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewKpiCard
          label="Eventos"
          value={kpiNumber(data?.eventsThisMonth)}
          icon={CalendarDays}
          iconClass="bg-violet-100 text-violet-600"
          change={kpiChange("events")}
        />
        <OverviewKpiCard
          label="Orçamentos"
          value={kpiNumber(data?.proposalsInMonth)}
          icon={ClipboardList}
          iconClass="bg-violet-100 text-violet-600"
          change={kpiChange("proposals")}
        />
        <OverviewKpiCard
          label="Visitas Agendadas"
          value={kpiNumber(data?.totalVisits)}
          icon={Users}
          iconClass="bg-violet-100 text-violet-600"
          change={kpiChange("visits")}
        />
        <OverviewKpiCard
          label={receitaTitulo}
          value={kpiNumber(
            <NumericFormat
              value={receitaValor}
              displayType="text"
              thousandSeparator="."
              decimalSeparator=","
              prefix="R$ "
              decimalScale={2}
              fixedDecimalScale
            />
          )}
          icon={CreditCard}
          iconClass="bg-emerald-100 text-emerald-600"
          change={kpiChange("revenue")}
        />
      </div>
    </div>
  );
}
