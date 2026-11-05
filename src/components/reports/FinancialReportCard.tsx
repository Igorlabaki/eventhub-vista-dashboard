import { useState } from "react";
import { Area, AreaChart, Bar, CartesianGrid, ComposedChart, LabelList, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Layers, Lightbulb, Percent, Receipt, Repeat, Scale, Trophy, TrendingUp, Wallet } from "lucide-react";
import { REPORT_MONTHS } from "./report-metrics";
import { buildFinanceModel, FinanceDelta, FinanceInput, FinanceModel } from "./finance-metrics";
import { SeriesToggle, panelEnter } from "./SlidingSelection";

const ICONS = {
  revenue: Wallet,
  expenses: Receipt,
  net: TrendingUp,
  margin: Percent,
} as const;

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const points = data.map((value, index) => ({ index, value }));
  return (
    <div className="h-10 w-24" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points}>
          <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.16} strokeWidth={2} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function Delta({ delta }: { delta: FinanceDelta }) {
  if (!delta.text) {
    return <p className="text-xs font-medium text-slate-400" aria-label={delta.aria}>—</p>;
  }
  const tone = delta.tone === "up" ? "text-emerald-600" : delta.tone === "down" ? "text-red-600" : "text-slate-500";
  return <p className={`text-xs font-medium ${tone}`}>{delta.text}</p>;
}

function money(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function MonthlyChart({ model }: { model: FinanceModel }) {
  const [mode, setMode] = useState<"valores" | "margem">("valores");
  const data = REPORT_MONTHS.map((name, index) => ({
    name,
    revenue: model.revenueMonths[index] || 0,
    expense: model.expenseMonths[index] || 0,
    margin: model.marginMonths[index] || 0,
  }));
  const visible = mode === "valores"
    ? data.flatMap((item) => [item.revenue, item.expense])
    : data.map((item) => item.margin);
  const min = Math.min(0, ...visible);
  const max = Math.max(0, ...visible);
  const subtitle = mode === "valores" ? model.chartSubtitle : model.marginSubtitle;

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <Scale className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">{model.chartTitle}</h2>
            <p key={subtitle} className={`text-sm text-slate-500 ${panelEnter}`}>{subtitle}</p>
          </div>
        </div>
        <SeriesToggle
          label="Série do gráfico"
          value={mode}
          onChange={setMode}
          options={[
            { value: "valores", label: "Valores" },
            { value: "margem", label: "Margem" },
          ]}
        />
      </div>
      <div key={mode} className={`h-80 w-full ${panelEnter}`} role="img" aria-label={`${model.chartTitle}. ${subtitle}`}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 28, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="financeBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#6d5ef5" />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#eef0f6" />
            <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              domain={[min === 0 ? 0 : min * 1.25, max === 0 ? 1 : max * 1.25]}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={56}
              tickFormatter={(value: number) => (
                mode === "margem"
                  ? `${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%`
                  : value.toLocaleString("pt-BR", { notation: "compact", maximumFractionDigits: 1 })
              )}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                mode === "margem"
                  ? `${Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`
                  : money(Number(value)),
                name,
              ]}
            />
            <Bar
              dataKey={mode === "valores" ? "revenue" : "margin"}
              name={mode === "valores" ? "Receita" : "Margem"}
              fill="url(#financeBar)"
              radius={[8, 8, 0, 0]}
              maxBarSize={36}
              isAnimationActive={false}
            >
              {mode === "valores" && (
                <LabelList
                  dataKey="revenue"
                  position="top"
                  fill="#5b4cdb"
                  fontSize={12}
                  fontWeight={600}
                  formatter={(value: number) => (value ? value.toLocaleString("pt-BR", { notation: "compact", maximumFractionDigits: 1 }) : "")}
                />
              )}
            </Bar>
            <Line
              type="monotone"
              dataKey={mode === "valores" ? "expense" : "margin"}
              name={mode === "valores" ? "Despesa" : "Tendência"}
              stroke="#6d5ef5"
              strokeWidth={2}
              dot={{ r: 4, fill: "#fff", stroke: "#6d5ef5", strokeWidth: 2 }}
              isAnimationActive={false}
            >
              {mode === "margem" && (
                <LabelList
                  dataKey="margin"
                  position="top"
                  fill="#5b4cdb"
                  fontSize={12}
                  fontWeight={600}
                  formatter={(value: number) => (value ? value.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) : "")}
                />
              )}
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center justify-center gap-6 text-xs text-slate-500">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-violet-500" aria-hidden />
          {mode === "valores" ? "Receita" : "Margem"}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-violet-500" aria-hidden />
          {mode === "valores" ? "Despesa" : "Tendência"}
        </span>
      </div>
      <ul className="sr-only">
        {data.map((item) => (
          <li key={item.name}>{item.name} receita {money(item.revenue)} despesa {money(item.expense)} margem {item.margin.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%</li>
        ))}
      </ul>
    </section>
  );
}

function Composition({ model }: { model: FinanceModel }) {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm lg:col-span-3">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
          <Layers className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-800">Composição das despesas</h2>
          <p className="text-sm text-slate-500">{model.compositionSubtitle}</p>
        </div>
      </div>
      {model.compositionEmpty ? (
        <p className="py-8 text-center text-sm text-slate-400">Nenhuma despesa cadastrada</p>
      ) : (
        <div className="space-y-3">
          {model.composition.map((item) => {
            const inside = item.percent >= 78;
            return (
              <div key={item.name} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm text-slate-500">{item.name}</span>
                <div className="relative h-7 flex-1">
                  <div className="absolute inset-0 rounded-full bg-slate-100" />
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ width: `${item.percent}%`, background: item.color }}
                  />
                  {item.value > 0 && (
                    <span
                      className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-xs font-semibold ${inside ? "-translate-x-full pr-2 text-white" : "pl-1.5 text-slate-700"}`}
                      style={{ left: `${item.percent}%` }}
                    >
                      {money(item.value)}
                    </span>
                  )}
                </div>
                <span className="w-10 text-right text-sm text-slate-400">{item.percent}%</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Insight({ icon, label, value, valueClass }: { icon: JSX.Element; label: string; value: string; valueClass: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-violet-600">{icon}</div>
        <span className="text-sm text-slate-600">{label}</span>
      </div>
      <span className={`shrink-0 text-sm font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}

export function FinancialReportCard({ input }: { input: FinanceInput }) {
  const model = buildFinanceModel(input);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {model.kpis.map((kpi) => {
          const Icon = ICONS[kpi.key];
          const iconClass = kpi.key === "margin" ? "bg-emerald-100 text-emerald-600" : "bg-violet-100 text-violet-600";
          return (
            <article key={kpi.key} className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}>
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{kpi.label}</p>
                  <p className="text-2xl font-semibold tracking-tight text-slate-900">{kpi.value}</p>
                </div>
              </div>
              <div className="mt-3 flex items-end justify-between gap-2">
                <Delta delta={kpi.delta} />
                <Sparkline data={kpi.spark} color={kpi.color} />
              </div>
            </article>
          );
        })}
      </div>
      <MonthlyChart model={model} />
      <div className="grid gap-4 lg:grid-cols-5">
        <Composition model={model} />
        <section className="rounded-2xl border bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-500">
              <Lightbulb className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Principais insights</h2>
              <p className="text-sm text-slate-500">{model.insightsSubtitle}</p>
            </div>
          </div>
          <div className="space-y-3">
            <Insight icon={<Trophy className="h-4 w-4" aria-hidden />} label="Maior despesa" value={model.largest ?? "—"} valueClass="text-violet-700" />
            <Insight icon={<Repeat className="h-4 w-4" aria-hidden />} label="Despesa mensal" value={model.monthlyExpense} valueClass="text-violet-700" />
            <Insight icon={<Receipt className="h-4 w-4" aria-hidden />} label="Esporádicas" value={model.sporadicExpense} valueClass="text-violet-700" />
            <Insight icon={<Scale className="h-4 w-4" aria-hidden />} label="Margem líquida" value={model.marginLabel} valueClass="text-emerald-600" />
          </div>
        </section>
      </div>
    </div>
  );
}
