import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";

interface StatCardProps {
  title: string;
  subtitle?: string;
  value: string | number | ReactNode;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}
const mesAtual = format(new Date(), "MMMM", { locale: ptBR });

export function StatCard({ title, value, icon, trend, className, subtitle }: StatCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-col">
          <CardTitle className="text-sm md:text-lg font-medium">{title}</CardTitle>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className="h-6 w-6 md:h-9 md:w-9 rounded-full bg-eventhub-tertiary/30 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-[15px] md:text-2xl  font-bold">{value}</div>
        {trend && (
          <p
            className={`text-xs ${
              trend.isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {trend.isPositive ? "+" : "-"}
            {trend.value.toFixed(0)}% em relação ao mês anterior
          </p>
        )}
      </CardContent>
    </Card>
  );
}
