import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ProposalListDailyPoint } from "@/types/proposal";

interface ProposalSparklineProps {
  daily: ProposalListDailyPoint[];
  dataKey: "count" | "amount" | "conversionRate";
  color: string;
}

export function ProposalSparkline({ daily, dataKey, color }: ProposalSparklineProps) {
  return (
    <div className="h-12 w-28" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={daily}>
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            fill={color}
            fillOpacity={0.16}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
