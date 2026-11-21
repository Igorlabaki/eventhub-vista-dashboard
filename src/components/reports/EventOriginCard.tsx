import { MapPin } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useReportEventOrigin } from "@/hooks/venue/queries/venueReportBlocks";
import { EventOriginData, EventOriginPlace } from "@/types/venue";
import { ReportBlock } from "./ReportBlock";

const SLICE_COLORS = ["#6d5ef5", "#E94F4A", "#3ED6C5", "#3A6DF0", "#A259F7", "#FFD600", "#F75C9C", "#f59e0b"];
const TOP_NEIGHBORHOODS = 5;

/** Maior resto: os percentuais inteiros de um donut sempre somam 100. */
function wholePercents(values: number[]): number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return values.map(() => 0);
  const raw = values.map((value) => (value / total) * 100);
  const result = raw.map(Math.floor);
  let left = 100 - result.reduce((sum, value) => sum + value, 0);
  raw
    .map((value, index) => ({ index, rest: value - result[index] }))
    .sort((a, b) => b.rest - a.rest)
    .forEach(({ index }) => {
      if (left <= 0) return;
      result[index] += 1;
      left -= 1;
    });
  return result;
}

export function originCardRetry(refetch: () => unknown) {
  return () => {
    void refetch();
  };
}

export function EventOriginView({
  year,
  data,
  isLoading,
  error,
  onRetry,
}: {
  year: number;
  data?: EventOriginData;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}) {
  return (
    <ReportBlock
      icon={MapPin}
      title="De onde vem os eventos"
      subtitle={data ? `${data.events} ${data.events === 1 ? "evento aprovado" : "eventos aprovados"} em ${year}` : `Eventos aprovados em ${year}`}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      isEmpty={!!data && data.events === 0}
    >
      {data && data.events > 0 && (
        <div className="grid gap-8 lg:grid-cols-3">
          <OriginDonut title="Cidades" places={data.cities} />
          <OriginDonut title="Estados" places={data.states} />
          <OriginDonut title="Bairros" places={data.neighborhoods.slice(0, TOP_NEIGHBORHOODS)} />
        </div>
      )}
    </ReportBlock>
  );
}

function OriginDonut({ title, places }: { title: string; places: EventOriginPlace[] }) {
  const total = places.reduce((sum, place) => sum + place.count, 0);
  const percents = wholePercents(places.map((place) => place.count));
  const slices = places.map((place, index) => ({
    name: place.label,
    value: place.count,
    percent: percents[index],
    color: SLICE_COLORS[index % SLICE_COLORS.length],
  }));

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-slate-700">{title}</h3>
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-44 w-44 shrink-0" role="img" aria-label={`${title}: ${total}`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="name"
                innerRadius="62%"
                outerRadius="100%"
                paddingAngle={slices.length > 1 ? 2 : 0}
                stroke="none"
                isAnimationActive={false}
              >
                {slices.map((slice) => (
                  <Cell key={slice.name} fill={slice.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string, item: { payload?: { percent?: number } }) => [
                  `${value} (${item.payload?.percent ?? 0}%)`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-semibold tracking-tight text-slate-900">{total}</span>
          </div>
        </div>
        <ul className="w-full space-y-2">
          {slices.map((slice) => (
            <li key={slice.name} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
              <span className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: slice.color }} aria-hidden />
                {slice.name}
              </span>
              <span className="shrink-0 text-sm">
                <span className="font-semibold text-slate-800">{slice.value}</span>
                <span className="text-slate-400"> · {slice.percent}%</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function EventOriginCard({ venueId, year }: { venueId?: string; year: number }) {
  const query = useReportEventOrigin(venueId, year);
  return (
    <EventOriginView
      year={year}
      data={query.data}
      isLoading={query.isPending}
      error={query.error}
      onRetry={originCardRetry(query.refetch)}
    />
  );
}
