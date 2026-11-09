import { Minus, TrendingDown, TrendingUp } from "lucide-react";

export function YearlyChange({ value }: { value: number | null | undefined }) {
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
