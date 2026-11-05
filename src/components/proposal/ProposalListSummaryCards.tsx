import { ClipboardList, Minus, Percent, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { ProposalListSummary } from "@/types/proposal";
import { ProposalSparkline } from "./ProposalSparkline";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

interface ProposalListSummaryCardsProps {
  summary: ProposalListSummary | null;
}

function YearlyChange({ value }: { value: number | null | undefined }) {
  if (value === undefined) return null;
  if (value === null) {
    return (
      <p className="text-xs font-medium text-muted-foreground" aria-label="sem comparação com o ano anterior">
        —
      </p>
    );
  }

  const tone = value > 0 ? "text-emerald-600" : value < 0 ? "text-red-600" : "text-muted-foreground";
  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
  const label = value > 0
    ? `${value}% acima do mesmo período do ano anterior`
    : value < 0
      ? `${Math.abs(value)}% abaixo do mesmo período do ano anterior`
      : "igual ao mesmo período do ano anterior";
  const visible = value > 0 ? `+${value}%` : `${value}%`;

  return (
    <p className={`flex items-center gap-1 text-xs font-medium tabular-nums ${tone}`} aria-label={label}>
      <Icon className="h-3 w-3" aria-hidden />
      <span aria-hidden>{visible}</span>
    </p>
  );
}

export function ProposalListSummaryCards({ summary }: ProposalListSummaryCardsProps) {
  const daily = summary?.daily ?? [];
  const cards = [
    {
      label: "Total de orçamentos",
      value: String(summary?.total ?? 0),
      icon: ClipboardList,
      iconClass: "bg-violet-100 text-violet-600",
      color: "#7c3aed",
      dataKey: "count" as const,
      change: summary?.change?.total,
    },
    {
      label: "Valor no mês",
      value: money.format(summary?.monthAmount ?? 0),
      icon: Wallet,
      iconClass: "bg-emerald-100 text-emerald-600",
      color: "#059669",
      dataKey: "amount" as const,
      change: summary?.change?.monthAmount,
    },
    {
      label: "Conversão",
      value: `${summary?.conversionRate ?? 0}%`,
      icon: Percent,
      iconClass: "bg-violet-100 text-violet-600",
      color: "#7c3aed",
      dataKey: "conversionRate" as const,
      change: summary?.change?.conversionRate,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="flex items-start justify-between rounded-2xl border bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconClass}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-semibold tracking-tight">{card.value}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <YearlyChange value={summary ? card.change : undefined} />
            <ProposalSparkline daily={daily} dataKey={card.dataKey} color={card.color} />
          </div>
        </div>
      ))}
    </div>
  );
}
