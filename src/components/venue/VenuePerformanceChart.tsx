import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Legend
} from 'recharts';
import { VenueDashboardData } from "@/types/venue";
import { Goal } from "@/types/goal";

interface VenuePerformanceChartProps {
  data: VenueDashboardData;
  goals: Goal[];
  months: string[];
  selectedMonth: number;
}

export function VenuePerformanceChart({ data, goals, months, selectedMonth }: VenuePerformanceChartProps) {
  const isTodos = String(selectedMonth) === 'all';

  let chartData = [];

  if (isTodos && Array.isArray(data.monthlyRevenueList)) {
    chartData = data.monthlyRevenueList.map((item) => {
      const goalDoMes = goals.find(g =>
        g.months.split(',').map(m => m.trim()).includes(String(item.month))
      );
      return {
        name: months[Number(item.month)], // Ex: "janeiro"
        Receita: item.revenue || 0,
        Meta: goalDoMes?.minValue || 0,
      };
    });
  } else {
    const mesAtual = selectedMonth;
    const goalDoMes = goals.find(g =>
      g.months.split(',').map(m => m.trim()).includes(String(mesAtual))
    );
    const receita = data.monthlyRevenue || 0;
    const meta = goalDoMes?.minValue || 0;
    chartData = [{
      name: months[mesAtual],
      Receita: receita,
      Meta: meta,
    }];
  }

  const maxValue = Math.max(...chartData.map(item => Math.max(item.Receita, item.Meta)));

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          barCategoryGap="40%"
          margin={{ top: 40, right: 40, left: 60, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis
            tickFormatter={formatCurrency}
            domain={[0, maxValue * 1.2]}
          />
          <Tooltip formatter={formatCurrency} />
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
          <Bar
            dataKey="Meta"
            fill="#8B5CF6"
            radius={[12, 12, 0, 0]}
            animationDuration={1200}
          >
            <LabelList
              dataKey="Meta"
              position="top"
              formatter={formatCurrency}
              fill="#8B5CF6"
              fontWeight="bold"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 