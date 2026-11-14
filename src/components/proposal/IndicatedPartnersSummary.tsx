import { CircleCheck, CircleDashed, Users } from "lucide-react";

interface IndicatedPartnersSummaryProps {
  total: number;
  indicated: number;
}

export function IndicatedPartnersSummary({ total, indicated }: IndicatedPartnersSummaryProps) {
  const cards = [
    {
      label: "Parceiros",
      value: total,
      icon: Users,
      iconClass: "bg-violet-100 text-violet-600",
    },
    {
      label: "Indicados",
      value: indicated,
      icon: CircleCheck,
      iconClass: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Não indicados",
      value: Math.max(total - indicated, 0),
      icon: CircleDashed,
      iconClass: "bg-gray-100 text-gray-500",
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
