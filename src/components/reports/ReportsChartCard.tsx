import { useState } from "react";
import { Area, AreaChart, Bar, CartesianGrid, ComposedChart, LabelList, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Calendar, CreditCard, Instagram, Layers, Lightbulb, Percent, Trophy, Users } from "lucide-react";
import { REPORT_MONTHS, ReportDelta, ReportKind, ReportModel, buildReportModel, ReportInput } from "./report-metrics";
import { SeriesToggle, panelEnter } from "./SlidingSelection";

const ICONS = {
  count: Calendar,
  conversion: Percent,
  ticket: CreditCard,
  people: Users,
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

function Delta({ delta }: { delta: ReportDelta }) {
  if (!delta.text) {
    return <p className="text-xs font-medium text-slate-400" aria-label={delta.aria}>—</p>;
  }
  const tone = delta.tone === "up" ? "text-emerald-600" : delta.tone === "down" ? "text-red-600" : "text-slate-500";
  return <p className={`text-xs font-medium ${tone}`}>{delta.text}</p>;
}

const AVERAGE_NAME = "Média dos anos";

function MonthlyChart({ model }: { model: ReportModel }) {
  const [mode, setMode] = useState<"quantity" | "conversion">("quantity");
  const series = mode === "quantity" ? model.quantitySeries : model.conversionSeries;
  const previousSeries = mode === "quantity" ? model.previousQuantitySeries : model.previousConversionSeries;
  const averageSeries = mode === "quantity" ? model.averageQuantitySeries : model.averageConversionSeries;
  const data = REPORT_MONTHS.map((name, index) => ({
    name,
    value: series[index] || 0,
    previous: previousSeries ? previousSeries[index] || 0 : undefined,
    average: averageSeries ? averageSeries[index] || 0 : undefined,
  }));
  const max = Math.max(...data.flatMap((item) => [item.value, item.previous ?? 0, item.average ?? 0]), 0);
  const seriesName = mode === "quantity" ? model.quantityToggle : "Taxa de conversão";
  const format = (value: number, decimals: number) => {
    if (mode === "conversion") return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
    return value.toLocaleString("pt-BR", { maximumFractionDigits: decimals });
  };

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <Calendar className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">{model.chartTitle}</h2>
            <p className="text-sm text-slate-500">{model.chartSubtitle}</p>
          </div>
        </div>
        <SeriesToggle
          label="Série do gráfico"
          value={mode}
          onChange={setMode}
          options={[
            { value: "quantity", label: model.quantityToggle },
            { value: "conversion", label: "Taxa de conversão" },
          ]}
        />
      </div>
      <div key={mode} className={`h-80 w-full ${panelEnter}`} role="img" aria-label={`${model.chartTitle}. ${model.chartSubtitle}`}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 28, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="reportBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#6d5ef5" />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#eef0f6" />
            <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              domain={[0, max === 0 ? 1 : Math.ceil(max * 1.25)]}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              formatter={(value: number, name: string, item: { dataKey?: string | number }) => {
                if (item.dataKey === "value") return [format(value, 0), seriesName];
                return [format(value, 1), name];
              }}
            />
            <Bar dataKey="value" name={seriesName} fill="url(#reportBar)" radius={[8, 8, 0, 0]} maxBarSize={36} isAnimationActive={false} />
            {previousSeries && (
              <Line
                type="monotone"
                dataKey="previous"
                name={model.previousLabel}
                stroke="#94a3b8"
                strokeWidth={2}
                dot={{ r: 3, fill: "#fff", stroke: "#94a3b8", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            )}
            {averageSeries && (
              <Line
                type="monotone"
                dataKey="average"
                name={AVERAGE_NAME}
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                isAnimationActive={false}
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              name="Tendência"
              stroke="#6d5ef5"
              strokeWidth={2}
              dot={{ r: 4, fill: "#fff", stroke: "#6d5ef5", strokeWidth: 2 }}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="value"
                position="top"
                fill="#5b4cdb"
                fontSize={12}
                fontWeight={600}
                formatter={(value: number) => {
                  if (!value) return "";
                  if (mode === "conversion") return value.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
                  return String(Math.round(value));
                }}
              />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center justify-center gap-6 text-xs text-slate-500">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-violet-500" aria-hidden />
          {seriesName}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-violet-500" aria-hidden />
          Tendência
        </span>
        {previousSeries && (
          <span className="inline-flex items-center gap-2">
            <span className="h-0.5 w-4 rounded-full bg-slate-400" aria-hidden />
            {model.previousLabel}
          </span>
        )}
        {averageSeries && (
          <span className="inline-flex items-center gap-2">
            <span className="w-4 border-t-2 border-dashed border-amber-500" aria-hidden />
            {AVERAGE_NAME}
          </span>
        )}
      </div>
      <ul className="sr-only">
        {data.map((item) => (
          <li key={item.name}>
            {item.name} {mode === "conversion" ? `${item.value.toFixed(1)}%` : item.value}
            {item.previous !== undefined && `, ${model.previousLabel} ${format(item.previous, 1)}`}
            {item.average !== undefined && `, ${AVERAGE_NAME.toLowerCase()} ${format(item.average, 1)}`}
          </li>
        ))}
      </ul>
    </section>
  );
}

function LeadBars({ model }: { model: ReportModel }) {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm lg:col-span-3">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
          <Layers className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-800">Origem dos leads</h2>
          <p className="text-sm text-slate-500">{model.leadsSubtitle}</p>
        </div>
      </div>
      <div className="space-y-3">
        {model.traffic.map((item) => {
          const inside = item.percent >= 78;
          return (
            <div key={item.name} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-sm text-slate-500">{item.name}</span>
              <div className="relative h-7 flex-1">
                <div className="absolute inset-0 rounded-full bg-slate-100" />
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${item.percent}%`, background: item.color }}
                />
                {item.value > 0 && (
                  <span
                    className={`absolute top-1/2 -translate-y-1/2 text-xs font-semibold ${inside ? "-translate-x-full pr-2 text-white" : "pl-1.5 text-slate-700"}`}
                    style={{ left: `${item.percent}%` }}
                  >
                    {item.value}
                  </span>
                )}
              </div>
              <span className="w-10 text-right text-sm text-slate-400">{item.percent}%</span>
            </div>
          );
        })}
      </div>
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

export function ReportsChartCard({ kind, input }: { kind: ReportKind; input: ReportInput }) {
  const model = buildReportModel({ ...input, kind });
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {model.kpis.map((kpi) => {
          const Icon = ICONS[kpi.key];
          const iconClass = kpi.key === "conversion" ? "bg-emerald-100 text-emerald-600" : "bg-violet-100 text-violet-600";
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
        <LeadBars model={model} />
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
            <Insight icon={<Trophy className="h-4 w-4" aria-hidden />} label="Melhor mês" value={model.bestMonth ?? "—"} valueClass="text-violet-700" />
            <Insight icon={<Calendar className="h-4 w-4" aria-hidden />} label={model.participationLabel} value={model.participation ?? "—"} valueClass="text-violet-700" />
            <Insight icon={<Layers className="h-4 w-4" aria-hidden />} label="Principal canal" value={model.topChannel ?? "—"} valueClass="text-violet-700" />
            <Insight icon={<Instagram className="h-4 w-4" aria-hidden />} label="Canal social líder" value={model.socialLeader ?? "—"} valueClass="text-pink-500" />
          </div>
        </section>
      </div>
    </div>
  );
}
