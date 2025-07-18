import { StatCard } from "@/components/StatCard";
import { CalendarDays, ClipboardList, Users, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { VenueDashboardData } from "@/types/venue";
import { NumericFormat } from 'react-number-format';
import { ProposalsChart, VisitsChart, RevenueChart } from "./VenueStatsChart";

interface VenueStatsPanelProps {
  data: VenueDashboardData;
  selectedMonth: string;
  selectedYear: number;
  onMonthChange: (month: string) => void;
  onYearChange: (year: number) => void;
  months: string[];
  years: number[];
}

export function VenueStatsPanel({
  data,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  months,
  years,
}: VenueStatsPanelProps) {
  // Para exibir o mês no StatCard
  const monthLabel = selectedMonth === "all"
    ? "Todos os meses"
    : months[Number(selectedMonth)];

  // Formatação de moeda brasileira
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Título e valor dinâmicos para receita
  const receitaTitulo = selectedMonth === "all" ? "Receita Anual" : "Receita Mensal";
  const receitaValor = selectedMonth === "all"
    ? (data?.monthlyRevenueList?.reduce((acc, curr) => acc + (curr.revenue || 0), 0) || 0)
    : (data?.monthlyRevenue || 0);
    
  return (
    <div>
      {/* Filtros de mês e ano */}
      <div className="flex gap-2 mb-4">
        <select
          value={selectedMonth}
          onChange={e => onMonthChange(e.target.value)}
          className="border rounded px-2 py-1"
        >
          {months.map((m, i) => (
            <option key={i === 0 ? "all" : i} value={i === 0 ? "all" : String(i)}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={e => onYearChange(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Eventos"
          value={data?.eventsThisMonth}
          icon={<CalendarDays className="h-5 w-5 text-eventhub-primary" />}
        />
        <StatCard
          title="Orçamentos"
          value={data?.proposalsInMonth}
          icon={<ClipboardList className="h-5 w-5 text-eventhub-primary" />}
          trend={data?.proposalsVariation}
        />
        <StatCard
          title="Visitas Agendadas"
          value={data?.totalVisits}
          icon={<Users className="h-5 w-5 text-eventhub-primary" />}
        />
        <StatCard
          title={receitaTitulo}
          value={
            <NumericFormat
              value={receitaValor}
              displayType="text"
              thousandSeparator="."
              decimalSeparator=","
              prefix="R$ "
              decimalScale={2}
              fixedDecimalScale
            />
          }
          icon={<CreditCard className="h-5 w-5 text-eventhub-primary" />}
        />
      </div>
    </div>
  );
} 