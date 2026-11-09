import { ClipboardList, Percent, Wallet } from "lucide-react";
import { ProposalListSummary } from "@/types/proposal";
import { YearlyChange } from "@/components/ui/yearly-change";
import { ProposalSparkline } from "./ProposalSparkline";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

interface ProposalListSummaryCardsProps {
  summary: ProposalListSummary | null;
  kind?: "budgets" | "events";
  showAmount?: boolean;
}

export function ProposalListSummaryCards({ summary, kind = "budgets", showAmount = true }: ProposalListSummaryCardsProps) {
  const daily = summary?.daily ?? [];
  const isEvents = kind === "events";
  const cards = [
    {
      label: isEvents ? "Total de eventos" : "Total de orçamentos",
      value: String(summary?.total ?? 0),
      icon: ClipboardList,
      iconClass: "bg-violet-100 text-violet-600",
      color: "#7c3aed",
      dataKey: "count" as const,
      change: summary?.change?.total,
      visible: true,
    },
    {
      label: "Valor no mês",
      value: money.format(summary?.monthAmount ?? 0),
      icon: Wallet,
      iconClass: "bg-emerald-100 text-emerald-600",
      color: "#059669",
      dataKey: "amount" as const,
      change: summary?.change?.monthAmount,
      visible: showAmount,
    },
    {
      label: "Conversão",
      value: `${summary?.conversionRate ?? 0}%`,
      icon: Percent,
      iconClass: "bg-violet-100 text-violet-600",
      color: "#7c3aed",
      dataKey: "conversionRate" as const,
      change: summary?.change?.conversionRate,
      // com approved=true a conversao e sempre 100%
      visible: !isEvents,
    },
  ].filter((card) => card.visible);

  const columns = cards.length === 3 ? "md:grid-cols-3" : cards.length === 2 ? "md:grid-cols-2" : "md:grid-cols-1";

  return (
    <div className={`grid gap-4 ${columns}`}>
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
