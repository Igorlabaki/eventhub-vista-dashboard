import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReportOccupancy } from "@/hooks/venue/queries/venueReportBlocks";
import { OccupancyKey } from "@/types/venue";
import { ReportBlock } from "./ReportBlock";
import { SeriesToggle } from "./SlidingSelection";
import {
  FULL_YEAR_LABEL,
  OCCUPANCY_VIEWS,
  bandLabel,
  formatHours,
  monthOptionLabel,
  occupancyGrid,
  occupancySummary,
} from "./report-blocks";

const FULL_YEAR = "year";

function cellColor(intensity: number, minutes: number): string {
  if (minutes <= 0) return "#f1f5f9";
  return `rgba(124, 58, 237, ${(0.15 + intensity * 0.85).toFixed(3)})`;
}

export function OccupancyCard({ venueId, year }: { venueId?: string; year: number }) {
  const [view, setView] = useState<OccupancyKey>("total");
  const [month, setMonth] = useState<string>(FULL_YEAR);
  const monthNumber = month === FULL_YEAR ? undefined : Number(month);
  const query = useReportOccupancy(venueId, year, monthNumber);
  const data = query.data;
  const summary = data ? occupancySummary(data, view) : null;
  const grid = data ? occupancyGrid(data.cells, view, data.bandHours) : [];
  const bands = grid[0]?.cells ?? [];
  const viewLabel = OCCUPANCY_VIEWS.find((option) => option.key === view)?.label ?? "";

  return (
    <ReportBlock
      icon={CalendarClock}
      title="Ocupação da agenda"
      subtitle="Horas ocupadas por dia da semana e faixa de horário"
      isLoading={query.isPending}
      error={query.error}
      onRetry={() => query.refetch()}
      isEmpty={!!summary?.empty}
      actions={
        <>
          <SeriesToggle
            label="Tipo de registro"
            value={view}
            options={OCCUPANCY_VIEWS.map((option) => ({ value: option.key, label: option.label }))}
            onChange={setView}
          />
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="h-9 w-40 rounded-full text-sm" aria-label="Período da ocupação">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FULL_YEAR}>{FULL_YEAR_LABEL}</SelectItem>
              {Array.from({ length: 12 }, (_, index) => (
                <SelectItem key={index + 1} value={String(index + 1)}>
                  {monthOptionLabel(index + 1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      }
    >
      {data && summary && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">{summary.hours}</p>
              <p className="text-xs text-slate-500">ocupadas · {viewLabel.toLowerCase()} · {summary.period}</p>
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">{summary.days}</p>
              <p className="text-xs text-slate-500">{summary.days === 1 ? "dia com registro" : "dias com registro"}</p>
            </div>
          </div>

          <div className="overflow-x-auto" aria-hidden>
            <div className="grid min-w-[560px] gap-1" style={{ gridTemplateColumns: `3rem repeat(${bands.length}, minmax(0, 1fr))` }}>
              <span />
              {bands.map((cell) => (
                <span key={cell.band} className="text-center text-[10px] text-slate-400">
                  {bandLabel(cell.band, data.bandHours).split("–")[0]}h
                </span>
              ))}
              {grid.map((row) => (
                <div key={row.weekday} className="contents">
                  <span className="self-center text-xs text-slate-500">{row.label}</span>
                  {row.cells.map((cell) => (
                    <span
                      key={cell.band}
                      className="h-7 rounded-md"
                      style={{ background: cellColor(cell.intensity, cell.minutes) }}
                      title={`${row.name}, ${bandLabel(cell.band, data.bandHours)}: ${formatHours(cell.minutes)}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <table className="sr-only">
            <caption>Ocupação da agenda ({viewLabel}, {summary.period}) em horas por dia da semana e faixa de horário</caption>
            <thead>
              <tr>
                <th scope="col">Dia</th>
                {bands.map((cell) => (
                  <th key={cell.band} scope="col">{bandLabel(cell.band, data.bandHours)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.map((row) => (
                <tr key={row.weekday}>
                  <th scope="row">{row.name}</th>
                  {row.cells.map((cell) => (
                    <td key={cell.band}>{formatHours(cell.minutes)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2" aria-hidden>
              <span>menos</span>
              {[0.15, 0.4, 0.65, 1].map((alpha) => (
                <span key={alpha} className="h-3 w-5 rounded" style={{ background: `rgba(124, 58, 237, ${alpha})` }} />
              ))}
              <span>mais</span>
            </div>
            <p>
              Taxa de ocupação indisponível: os dias de funcionamento do espaço não estão definidos.
              {data.discarded > 0 && ` ${data.discarded} registro(s) com fim antes do início foram ignorados.`}
            </p>
          </div>
        </div>
      )}
    </ReportBlock>
  );
}
