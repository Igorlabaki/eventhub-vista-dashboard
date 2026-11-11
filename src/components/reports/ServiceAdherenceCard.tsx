import { useState } from "react";
import { PackagePlus } from "lucide-react";
import { useReportServiceAdherence } from "@/hooks/venue/queries/venueReportBlocks";
import { formatCurrency } from "@/lib/utils";
import { CategoryFilter, MeterBar, ReportBlock } from "./ReportBlock";
import { ALL_CATEGORIES, CategoryFilterValue, categoryFilterParam, coverageLabel, formatRate } from "./report-blocks";

export function ServiceAdherenceCard({ venueId, year }: { venueId?: string; year: number }) {
  const [category, setCategory] = useState<CategoryFilterValue>(ALL_CATEGORIES);
  const query = useReportServiceAdherence(venueId, year, categoryFilterParam(category));
  const data = query.data;

  return (
    <ReportBlock
      icon={PackagePlus}
      title="Aderência dos serviços adicionais"
      subtitle={data ? `Serviços nos ${data.approvedProposals} orçamentos aprovados de ${year}` : `Orçamentos aprovados de ${year}`}
      isLoading={query.isPending}
      error={query.error}
      onRetry={() => query.refetch()}
      isEmpty={!!data && data.services.length === 0}
      actions={<CategoryFilter value={category} onChange={setCategory} />}
    >
      {data && (
        <ol className="space-y-4">
          {data.services.map((service) => (
            <li key={service.serviceId} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-sm font-medium text-slate-700">{service.name}</span>
                <span className="shrink-0 text-sm tabular-nums text-slate-600">
                  {formatRate(service.adherence)} · {service.proposals} de {data.approvedProposals}
                </span>
              </div>
              <MeterBar percent={service.adherence * 100} label={`Adesão de ${formatRate(service.adherence)}`} />
              <p className="text-xs text-slate-500">
                {service.amountSum !== null
                  ? `${formatCurrency(service.amountSum)} valor em orçamentos aprovados · `
                  : ""}
                {coverageLabel(service.linesWithAmount, service.linesTotal)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </ReportBlock>
  );
}
