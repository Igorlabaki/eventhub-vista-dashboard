import { FileText, Image, Users } from "lucide-react";
import { ContactListSummary } from "@/types/contact";

interface ContactListSummaryCardsProps {
  summary: ContactListSummary | null;
}

export function ContactListSummaryCards({ summary }: ContactListSummaryCardsProps) {
  const cards = [
    {
      label: "Total",
      value: String(summary?.total ?? 0),
      icon: Users,
      iconClass: "bg-violet-100 text-violet-600",
    },
    {
      label: "Com logo",
      value: String(summary?.withLogo ?? 0),
      icon: Image,
      iconClass: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Com descrição",
      value: String(summary?.withDescription ?? 0),
      icon: FileText,
      iconClass: "bg-violet-100 text-violet-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="flex items-center gap-3 rounded-2xl border bg-white px-5 py-4">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconClass}`}>
            <card.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="text-2xl font-semibold tracking-tight tabular-nums">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
