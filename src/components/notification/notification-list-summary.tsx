import { Bell, CalendarRange, FileText, Mail } from "lucide-react";
import { YearlyChange } from "@/components/ui/yearly-change";
import { NotificationListSummary } from "@/types/notification";

interface NotificationListSummaryCardsProps {
  summary: NotificationListSummary | null;
}

export function NotificationListSummaryCards({ summary }: NotificationListSummaryCardsProps) {
  const cards = [
    {
      label: "Não lidas",
      value: String(summary?.unread ?? 0),
      icon: Mail,
      iconClass: "bg-violet-100 text-violet-600",
      change: undefined,
    },
    {
      label: "Últimos 7 dias",
      value: String(summary?.last7Days ?? 0),
      icon: Bell,
      iconClass: "bg-emerald-100 text-emerald-600",
      change: summary?.change?.last7Days,
    },
    {
      label: "Últimos 30 dias",
      value: String(summary?.last30Days ?? 0),
      icon: CalendarRange,
      iconClass: "bg-violet-100 text-violet-600",
      change: summary?.change?.last30Days,
    },
    {
      label: "Orçamentos novos",
      value: String(summary?.newProposals ?? 0),
      icon: FileText,
      iconClass: "bg-emerald-100 text-emerald-600",
      change: summary?.change?.newProposals,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="flex items-start justify-between gap-2 rounded-2xl border bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconClass}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-semibold tracking-tight tabular-nums">{card.value}</p>
            </div>
          </div>
          <YearlyChange value={card.change} base="previousPeriod" />
        </div>
      ))}
    </div>
  );
}
