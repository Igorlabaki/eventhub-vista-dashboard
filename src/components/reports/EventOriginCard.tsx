import { MapPin } from "lucide-react";
import { useReportEventOrigin } from "@/hooks/venue/queries/venueReportBlocks";
import { EventOriginData, EventOriginPlace } from "@/types/venue";
import { ReportBlock } from "./ReportBlock";

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
        <div className="grid gap-6 lg:grid-cols-3">
          <PlaceList title="Cidades" places={data.cities} />
          <PlaceList title="Estados" places={data.states} />
          <PlaceList title="Bairros" places={data.neighborhoods} />
        </div>
      )}
    </ReportBlock>
  );
}

function PlaceList({ title, places }: { title: string; places: EventOriginPlace[] }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-slate-700">{title}</h3>
      <ul className="space-y-2">
        {places.map((place) => (
          <li key={place.label} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
            <span className="text-slate-600">{place.label}</span>
            <span className="tabular-nums font-medium text-slate-800">{place.count}</span>
          </li>
        ))}
      </ul>
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
