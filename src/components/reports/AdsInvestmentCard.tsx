import { Megaphone } from "lucide-react";
import { useReportAds } from "@/hooks/venue/queries/venueReportBlocks";
import { formatCurrency } from "@/lib/utils";
import { AdsReportTotals } from "@/types/venue";
import { ReportBlock } from "./ReportBlock";
import { NO_VALUE_LABEL, adsChannelLabel, formatRoas } from "./report-blocks";

const ADS_EMPTY_LABEL = "Nenhum investimento em anúncios neste ano. Cadastre as despesas de Publicidade com o canal para ver o retorno por rede.";

const COLUMNS = ["Investido", "Orçamentos", "Custo/orçamento", "Eventos", "Custo/evento", "Retorno"];

function currencyOrDash(value: number | null): string {
  return value === null ? NO_VALUE_LABEL : formatCurrency(value);
}

function MetricCells({ row }: { row: AdsReportTotals }) {
  return (
    <>
      <td className="px-3 py-2.5 text-right">{formatCurrency(row.spent)}</td>
      <td className="px-3 py-2.5 text-right">{row.proposals}</td>
      <td className="px-3 py-2.5 text-right">{currencyOrDash(row.costPerProposal)}</td>
      <td className="px-3 py-2.5 text-right">{row.events}</td>
      <td className="px-3 py-2.5 text-right">{currencyOrDash(row.costPerEvent)}</td>
      <td className="px-3 py-2.5 text-right">{formatRoas(row.roas)}</td>
    </>
  );
}

export function AdsInvestmentCard({ venueId, year }: { venueId?: string; year: number }) {
  const query = useReportAds(venueId, year);
  const data = query.data;

  return (
    <ReportBlock
      icon={Megaphone}
      title="Investimento em anúncios"
      subtitle={`Despesas de Publicidade por canal e retorno dos orçamentos criados em ${year}`}
      isLoading={query.isPending}
      error={query.error}
      onRetry={() => query.refetch()}
      isEmpty={!!data && data.total.spent === 0}
      emptyLabel={ADS_EMPTY_LABEL}
    >
      {data && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-sm tabular-nums text-slate-700">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide text-slate-500">
                <th scope="col" className="px-3 py-2 text-left font-medium">Canal</th>
                {COLUMNS.map((column) => (
                  <th key={column} scope="col" className="px-3 py-2 text-right font-medium">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr key={row.channel ?? "none"} className="border-b last:border-0">
                  <th scope="row" className="px-3 py-2.5 text-left font-medium text-slate-800">{adsChannelLabel(row.channel)}</th>
                  <MetricCells row={row} />
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-violet-50 font-semibold text-slate-900">
                <th scope="row" className="rounded-l-lg px-3 py-2.5 text-left">Total</th>
                <MetricCells row={data.total} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </ReportBlock>
  );
}
