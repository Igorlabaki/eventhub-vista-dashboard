import { useState } from "react";
import { Hourglass } from "lucide-react";
import { useReportLeadTime } from "@/hooks/venue/queries/venueReportBlocks";
import { CategoryFilter, MeterBar, ReportBlock } from "./ReportBlock";
import {
  ALL_CATEGORIES,
  CategoryFilterValue,
  LEAD_TIME_LABELS,
  categoryFilterParam,
  formatDays,
  formatRate,
} from "./report-blocks";

export function LeadTimeCard({ venueId, year }: { venueId?: string; year: number }) {
  const [category, setCategory] = useState<CategoryFilterValue>(ALL_CATEGORIES);
  const query = useReportLeadTime(venueId, year, categoryFilterParam(category));
  const data = query.data;
  const maxTotal = data ? Math.max(...data.buckets.map((bucket) => bucket.total), 0) : 0;

  return (
    <ReportBlock
      icon={Hourglass}
      title="Antecedência dos pedidos"
      subtitle={`Dias entre o pedido e a data do evento · orçamentos criados em ${year}`}
      isLoading={query.isPending}
      error={query.error}
      onRetry={() => query.refetch()}
      isEmpty={!!data && data.created === 0}
      actions={<CategoryFilter value={category} onChange={setCategory} />}
    >
      {data && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">{formatDays(data.medianDays)}</p>
              <p className="text-xs text-slate-500">mediana de antecedência</p>
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">{data.considered}</p>
              <p className="text-xs text-slate-500">de {data.created} orçamentos considerados</p>
            </div>
          </div>

          <div className="space-y-3">
            {data.buckets.map((bucket) => (
              <div key={bucket.key} className="grid grid-cols-[7.5rem_1fr_auto] items-center gap-3">
                <span className="text-sm text-slate-600">{LEAD_TIME_LABELS[bucket.key]}</span>
                <MeterBar percent={maxTotal > 0 ? (bucket.total / maxTotal) * 100 : 0} />
                <span className="whitespace-nowrap text-right text-sm tabular-nums text-slate-600">
                  {bucket.total} · {bucket.approved} aprovados · {formatRate(bucket.approvalRate)}
                </span>
              </div>
            ))}
          </div>

          {data.excluded > 0 && (
            <p className="text-xs text-slate-500">
              {data.excluded} {data.excluded === 1 ? "orçamento ficou" : "orçamentos ficaram"} fora do cálculo porque a data do evento é anterior à data do pedido.
            </p>
          )}
        </div>
      )}
    </ReportBlock>
  );
}
