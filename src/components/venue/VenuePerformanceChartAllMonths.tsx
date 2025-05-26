import {
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Legend,
  Line,
  ComposedChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';
import { VenueDashboardData } from "@/types/venue";
import { Goal } from "@/types/goal";

interface Props {
  data: VenueDashboardData;
  goals: Goal[];
  months: string[];
}

export function VenuePerformanceChartAllMonths({ data, goals, months }: Props) {
  const chartData = (data.monthlyRevenueList || []).map((item) => {
    const goalDoMes = goals.find(g =>
      g.months.split(',').map(m => m.trim()).includes(String(item.month))
    );
    return {
      name: months[Number(item.month)],
      Receita: item.revenue || 0,
      Meta: goalDoMes?.minValue || 0,
    };
  });

  const maxValue = Math.max(...chartData.map(item => Math.max(item.Receita, item.Meta)));

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 40, right: 40, left: 60, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-30} textAnchor="end" height={60} />
          <YAxis
            tickFormatter={formatCurrency}
            domain={[0, maxValue * 1.2]}
          />
          <Tooltip
            formatter={formatCurrency}
            labelFormatter={label => `Mês: ${label}`}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              fontWeight: 'bold',
              fontSize: 16,
            }}
          />
          <Bar
            dataKey="Receita"
            fill="#3B82F6"
            radius={[12, 12, 0, 0]}
            barSize={30}
            animationDuration={1200}
          >
            <LabelList
              dataKey="Receita"
              position="top"
              formatter={formatCurrency}
              fill="#3B82F6"
              fontWeight="bold"
            />
          </Bar>
          <Line
            type="monotone"
            dataKey="Meta"
            stroke="#8B5CF6"
            strokeWidth={3}
            dot={{ r: 5, fill: "#8B5CF6" }}
            activeDot={{ r: 7 }}
            name="Meta"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
} 