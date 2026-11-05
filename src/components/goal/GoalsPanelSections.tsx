import type { ReactNode } from "react";
import { Calculator, Calendar, GraduationCap, Pencil, Shield, Tag, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EMPTY_PANEL_LABEL,
  formatPanelMoney,
  isMinimumConfigured,
  panelBlockState,
  samplePanelItems,
  validMonthNumbers,
  type PanelBlockState,
} from "./goals-panel-metrics";

export interface PanelGoalCard {
  id: string;
  minValue: number;
  maxValue?: number;
  increasePercent: number;
  months: string;
}

export interface PanelFeeCard {
  id: string;
  title: string;
  startDay?: string;
  endDay?: string;
  affectedDays?: string;
  fee: number;
}

export interface PanelPeriodCard {
  id: string;
  title: string;
  startDay: string;
  endDay: string;
  price: number;
}

export interface GoalsPanelSectionsProps {
  canEdit: boolean;
  price: { label: string; price: number } | null;
  priceLoading: boolean;
  priceError: string | null;
  isEditingPrice: boolean;
  onEditPrice: () => void;
  priceEditor: ReactNode;
  goals: readonly PanelGoalCard[];
  goalsLoading: boolean;
  goalsError: string | null;
  surcharges: readonly PanelFeeCard[];
  discounts: readonly PanelFeeCard[];
  feesLoading: boolean;
  feesError: string | null;
  minimumPrice: number | null | undefined;
  venueLoading: boolean;
  venueError: string | null;
  periods: readonly PanelPeriodCard[];
  periodsLoading: boolean;
  periodsError: string | null;
  monthLabels: readonly string[];
  translateDays: (value: string) => string;
  onOpen: (tab: "metas" | "adicionais" | "minimos" | "descontos") => void;
  onCreateGoal: () => void;
  onCreateSurcharge: () => void;
  onCreateDiscount: () => void;
  onCreatePeriod: () => void;
}

export function GoalsPanelSections(props: GoalsPanelSectionsProps) {
  const priceState = panelBlockState({
    isLoading: props.priceLoading,
    error: props.priceError,
    hasData: props.price !== null,
  });
  const goalState = panelBlockState({
    isLoading: props.goalsLoading,
    error: props.goalsError,
    hasData: props.goals.length > 0,
  });
  const surchargeState = panelBlockState({
    isLoading: props.feesLoading,
    error: props.feesError,
    hasData: props.surcharges.length > 0,
  });
  const discountState = panelBlockState({
    isLoading: props.feesLoading,
    error: props.feesError,
    hasData: props.discounts.length > 0,
  });
  const minimumState = panelBlockState({
    isLoading: props.venueLoading,
    error: props.venueError,
    hasData: isMinimumConfigured(props.minimumPrice),
  });
  const periodState = panelBlockState({
    isLoading: props.periodsLoading,
    error: props.periodsError,
    hasData: props.periods.length > 0,
  });

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Modelo de Precificação</h2>
        <p className="text-sm text-muted-foreground">O modelo de preço atual para o espaço.</p>
        {props.isEditingPrice ? (
          <div className="mt-4">{props.priceEditor}</div>
        ) : (
          <div className="mt-4 flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <PanelBody state={priceState} error={props.priceError} empty={<EmptyCopy />}>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{props.price?.label}</p>
                    <p className="text-2xl font-semibold text-violet-700">
                      {props.price ? formatPanelMoney(props.price.price) : ""}
                    </p>
                  </div>
                </div>
              </PanelBody>
            </div>
            {props.canEdit && priceState !== "loading" ? (
              <Button type="button" variant="outline" onClick={props.onEditPrice}>
                <Pencil />
                Editar
              </Button>
            ) : null}
            <Calculator className="hidden h-16 w-16 shrink-0 text-violet-300 lg:block" />
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section
          icon={Target}
          title="Metas"
          subtitle="Acompanhe a meta de faturamento do espaço."
          tab="metas"
          onOpen={props.onOpen}
        >
          <PanelBody
            state={goalState}
            error={props.goalsError}
            empty={<EmptyCopy canEdit={props.canEdit} action="Nova Meta" onAction={props.onCreateGoal} />}
          >
            <div className="space-y-3">
              {samplePanelItems(props.goals).map((goal) => (
                <GoalCard key={goal.id} goal={goal} monthLabels={props.monthLabels} onOpen={() => props.onOpen("metas")} />
              ))}
            </div>
          </PanelBody>
        </Section>

        <Section
          icon={GraduationCap}
          title="Adicionais"
          subtitle="Valores adicionais aplicados em períodos específicos."
          tab="adicionais"
          onOpen={props.onOpen}
        >
          <PanelBody
            state={surchargeState}
            error={props.feesError}
            empty={<EmptyCopy canEdit={props.canEdit} action="Novo Adicional" onAction={props.onCreateSurcharge} />}
          >
            <div className="space-y-3">
              {samplePanelItems(props.surcharges).map((fee) => (
                <FeeCard
                  key={fee.id}
                  fee={fee}
                  tone="positive"
                  translateDays={props.translateDays}
                  onOpen={() => props.onOpen("adicionais")}
                />
              ))}
            </div>
          </PanelBody>
        </Section>
      </div>

      <Section
        icon={Shield}
        title="Preços mínimos"
        subtitle="Valores mínimos aplicados ao espaço."
        tab="minimos"
        onOpen={props.onOpen}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <PanelBody state={minimumState} error={props.venueError} empty={<EmptyCopy />}>
            <article className="rounded-2xl border bg-white p-4">
              <p className="text-sm text-muted-foreground">Preço mínimo padrão</p>
              <p className="text-lg font-semibold">{formatPanelMoney(props.minimumPrice || 0)}</p>
            </article>
          </PanelBody>
          <PanelBody
            state={periodState}
            error={props.periodsError}
            empty={<EmptyCopy canEdit={props.canEdit} action="Nova faixa" onAction={props.onCreatePeriod} />}
          >
            <div className="space-y-3">
              {samplePanelItems(props.periods).map((period) => (
                <button
                  key={period.id}
                  type="button"
                  data-panel-item="periodo"
                  data-panel-tab="minimos"
                  onClick={() => props.onOpen("minimos")}
                  className="flex w-full items-center justify-between rounded-2xl bg-violet-50 p-4 text-left"
                >
                  <div>
                    <p className="font-medium">{period.title}</p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {period.startDay} até {period.endDay}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-emerald-600">{formatPanelMoney(period.price)}</p>
                </button>
              ))}
            </div>
          </PanelBody>
        </div>
      </Section>

      <Section
        icon={Tag}
        title="Descontos"
        subtitle="Descontos configurados para períodos e condições específicas."
        tab="descontos"
        onOpen={props.onOpen}
      >
        <PanelBody
          state={discountState}
          error={props.feesError}
          empty={<EmptyCopy canEdit={props.canEdit} action="Novo Desconto" onAction={props.onCreateDiscount} />}
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {samplePanelItems(props.discounts).map((fee) => (
              <FeeCard
                key={fee.id}
                fee={fee}
                tone="negative"
                translateDays={props.translateDays}
                onOpen={() => props.onOpen("descontos")}
              />
            ))}
          </div>
        </PanelBody>
      </Section>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  subtitle,
  tab,
  onOpen,
  children,
}: {
  icon: typeof Target;
  title: string;
  subtitle: string;
  tab: "metas" | "adicionais" | "minimos" | "descontos";
  onOpen: (tab: "metas" | "adicionais" | "minimos" | "descontos") => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border bg-white p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <Button type="button" variant="link" data-panel-tab={tab} onClick={() => onOpen(tab)}>
          Ver todos
        </Button>
      </div>
      {children}
    </section>
  );
}

function PanelBody({
  state,
  error,
  empty,
  children,
}: {
  state: PanelBlockState;
  error: string | null;
  empty: ReactNode;
  children: ReactNode;
}) {
  if (state === "loading") {
    return <div className="h-24 animate-pulse rounded-2xl bg-muted" data-panel-state="loading" />;
  }
  if (state === "error") {
    return <p className="text-sm text-red-600">{error}</p>;
  }
  if (state === "empty") return <>{empty}</>;
  return <>{children}</>;
}

function EmptyCopy({
  canEdit = false,
  action,
  onAction,
}: {
  canEdit?: boolean;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="px-4 py-8 text-center">
      <p className="text-sm text-muted-foreground">{EMPTY_PANEL_LABEL}</p>
      {canEdit && action && onAction ? (
        <Button type="button" variant="link" onClick={onAction}>
          {action}
        </Button>
      ) : null}
    </div>
  );
}

function GoalCard({
  goal,
  monthLabels,
  onOpen,
}: {
  goal: PanelGoalCard;
  monthLabels: readonly string[];
  onOpen: () => void;
}) {
  const months = validMonthNumbers(goal.months);
  const amount = goal.maxValue
    ? `${formatPanelMoney(goal.minValue)} - ${formatPanelMoney(goal.maxValue)}`
    : formatPanelMoney(goal.minValue);
  const increase = goal.increasePercent > 0 ? `+${goal.increasePercent}%` : `${goal.increasePercent}%`;

  return (
    <button
      type="button"
      data-panel-item="meta"
      data-panel-tab="metas"
      onClick={onOpen}
      className="w-full rounded-2xl border p-4 text-left"
    >
      <p className="text-lg font-semibold">Meta: {amount}</p>
      {months.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1">
          {months.map((month) => (
            <span key={month} className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
              {monthLabels[month - 1]}
            </span>
          ))}
        </div>
      ) : null}
      <p className="mt-3 text-xs text-muted-foreground">Taxa de aumento</p>
      <p className={goal.increasePercent > 0 ? "font-semibold text-emerald-600" : "font-semibold"}>{increase}</p>
    </button>
  );
}

function FeeCard({
  fee,
  tone,
  translateDays,
  onOpen,
}: {
  fee: PanelFeeCard;
  tone: "positive" | "negative";
  translateDays: (value: string) => string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      data-panel-item={tone === "positive" ? "adicional" : "desconto"}
      data-panel-tab={tone === "positive" ? "adicionais" : "descontos"}
      onClick={onOpen}
      className="flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left"
    >
      <div>
        <p className="font-medium">{fee.title}</p>
        {fee.startDay && fee.endDay ? (
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {fee.startDay} até {fee.endDay}
          </p>
        ) : null}
        {fee.affectedDays ? (
          <p className="mt-1 text-sm text-muted-foreground">{translateDays(fee.affectedDays)}</p>
        ) : null}
      </div>
      <p className={tone === "positive" ? "text-lg font-bold text-emerald-600" : "text-lg font-bold text-red-600"}>
        {tone === "positive" ? `+${fee.fee}%` : `-${fee.fee}%`}
      </p>
    </button>
  );
}
