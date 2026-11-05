import { Calendar, GraduationCap, Shield, Tag, Target } from "lucide-react";
import {
  EMPTY_PANEL_LABEL,
  annualGoalTotal,
  formatPanelMoney,
  isCountConfigured,
  isMinimumConfigured,
  panelBlockState,
  resolveCurrentPrice,
  type PanelBlockState,
  type PanelGoalAmount,
  type PanelPriceSource,
} from "./goals-panel-metrics";

interface GoalsPanelSummaryProps {
  venueLoading: boolean;
  venueError: string | null;
  venue: (PanelPriceSource & { minimumPrice?: number | null }) | null;
  goalsLoading: boolean;
  goalsError: string | null;
  goals: readonly PanelGoalAmount[];
  feesLoading: boolean;
  feesError: string | null;
  surchargeCount: number;
  discountCount: number;
}

export function GoalsPanelSummary({
  venueLoading,
  venueError,
  venue,
  goalsLoading,
  goalsError,
  goals,
  feesLoading,
  feesError,
  surchargeCount,
  discountCount,
}: GoalsPanelSummaryProps) {
  const price = resolveCurrentPrice(venue);
  const annual = annualGoalTotal(goals);
  const priceState = panelBlockState({
    isLoading: venueLoading,
    error: venueError,
    hasData: price !== null,
  });
  const annualState = panelBlockState({
    isLoading: goalsLoading,
    error: goalsError,
    hasData: annual !== null,
  });
  const surchargeState = panelBlockState({
    isLoading: feesLoading,
    error: feesError,
    hasData: isCountConfigured(surchargeCount),
  });
  const discountState = panelBlockState({
    isLoading: feesLoading,
    error: feesError,
    hasData: isCountConfigured(discountCount),
  });
  const minimumState = panelBlockState({
    isLoading: venueLoading,
    error: venueError,
    hasData: isMinimumConfigured(venue?.minimumPrice),
  });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <SummaryCard
        icon={Calendar}
        label={price ? price.label : "Preço atual"}
        state={priceState}
        error={venueError}
        value={price ? formatPanelMoney(price.price) : ""}
      />
      <SummaryCard
        icon={Target}
        label="Meta anual"
        state={annualState}
        error={goalsError}
        value={annual === null ? "" : formatPanelMoney(annual)}
      />
      <SummaryCard
        icon={GraduationCap}
        label="Adicionais ativos"
        state={surchargeState}
        error={feesError}
        value={String(surchargeCount)}
      />
      <SummaryCard
        icon={Tag}
        label="Descontos ativos"
        state={discountState}
        error={feesError}
        value={String(discountCount)}
      />
      <SummaryCard
        icon={Shield}
        label="Mínimo padrão"
        state={minimumState}
        error={venueError}
        value={isMinimumConfigured(venue?.minimumPrice) ? formatPanelMoney(venue!.minimumPrice!) : ""}
      />
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  state,
  error,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  state: PanelBlockState;
  error: string | null;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-white px-5 py-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        {state === "loading" ? (
          <div className="mt-1 h-7 w-24 animate-pulse rounded bg-muted" />
        ) : state === "error" ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : state === "empty" ? (
          <p className="text-sm text-muted-foreground">{EMPTY_PANEL_LABEL}</p>
        ) : (
          <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
        )}
      </div>
    </div>
  );
}
