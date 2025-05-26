import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
  LineChart
} from 'recharts';
import { VenueDashboardData } from "@/types/venue";

interface VenueStatsChartProps {
  data: VenueDashboardData;
  months: string[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export function ProposalsChart({ data, months }: VenueStatsChartProps) {
  const chartData = months.map((month) => ({
    name: month,
    propostasRecebidas: data?.proposalsInMonth || 0,
  }));

  return (
    <div className="w-full h-[300px] bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Propostas</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="propostasRecebidas"
            name="Propostas Recebidas"
            fill="#93C5FD"
            stackId="a"
          />
          <Bar
            dataKey="propostasAprovadas"
            name="Propostas Aprovadas"
            fill="#86EFAC"
            stackId="a"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VisitsChart({ data, months }: VenueStatsChartProps) {
  const chartData = months.map((month) => ({
    name: month,
    visitasAgendadas: data?.totalVisits || 0,
  }));

  return (
    <div className="w-full h-[300px] bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Visitas</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="visitasAgendadas"
            name="Visitas Agendadas"
            fill="#FDE047"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueChart({ data, months }: VenueStatsChartProps) {
  const chartData = months.map((month) => ({
    name: month,
    receita: data?.monthlyRevenue || 0,
  }));

  return (
    <div className="w-full h-[300px] bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Receita</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value), 'Receita']}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="receita"
            name="Receita"
            stroke="#F97316"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 