import { UsersRound } from "lucide-react";
import { useReportEventProfile } from "@/hooks/venue/queries/venueReportBlocks";
import { MeterBar, ReportBlock } from "./ReportBlock";
import { GUEST_BUCKET_LABELS, capacityIndicator, categoryLabel } from "./report-blocks";

export function EventProfileCard({ venueId, year }: { venueId?: string; year: number }) {
  const query = useReportEventProfile(venueId, year);
  const data = query.data;
  const maxBucket = data ? Math.max(...data.guestBuckets.map((bucket) => bucket.count), 0) : 0;
  const capacity = data ? capacityIndicator(data.capacity) : null;

  return (
    <ReportBlock
      icon={UsersRound}
      title="Porte e perfil dos eventos"
      subtitle={data ? `${data.events} ${data.events === 1 ? "evento aprovado" : "eventos aprovados"} em ${year}` : `Eventos aprovados em ${year}`}
      isLoading={query.isPending}
      error={query.error}
      onRetry={() => query.refetch()}
      isEmpty={!!data && data.events === 0}
    >
      {data && capacity && (
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-medium text-slate-700">Convidados por evento</h3>
            <div className="space-y-2.5">
              {data.guestBuckets.map((bucket) => (
                <div key={bucket.key} className="grid grid-cols-[6.5rem_1fr_2.5rem] items-center gap-3">
                  <span className="text-sm text-slate-600">{GUEST_BUCKET_LABELS[bucket.key]}</span>
                  <MeterBar percent={maxBucket > 0 ? (bucket.count / maxBucket) * 100 : 0} />
                  <span className="text-right text-sm tabular-nums text-slate-600">{bucket.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium text-slate-700">Uso da capacidade</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-lg font-semibold text-slate-900">{capacity.atLeast80}</p>
                <p className="text-xs text-slate-500">com 80% ou mais da capacidade</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-lg font-semibold text-slate-900">{capacity.above100}</p>
                <p className="text-xs text-slate-500">acima da capacidade</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">{capacity.detail}</p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium text-slate-700">Categorias</h3>
            <ul className="space-y-2">
              {data.categories.map((item) => (
                <li key={item.eventCategory ?? "none"} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                  <span className="text-slate-600">{categoryLabel(item.eventCategory)}</span>
                  <span className="tabular-nums font-medium text-slate-800">{item.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </ReportBlock>
  );
}
