import { VenueCard } from "@/components/VenueCard";
import { VenueCardSkeleton } from "@/components/venue/VenueCardSkeleton";
import { FilterList } from "@/components/filterList";
import { EmptyState } from "@/components/EmptyState";
import type { ItemListVenueResponse } from "@/types/venue";
import type { DateEvent } from "@/types/date-event";

interface VenuesListProps {
  venues: ItemListVenueResponse[];
  isLoading: boolean;
  onCreateClick: () => void;
  organizationId: string;
  onEditClick?: (venueId: string) => void;
}

export function VenuesList({ venues, isLoading, onCreateClick, organizationId, onEditClick }: VenuesListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <VenueCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (venues.length === 0) {
    return (
      <EmptyState
        title="Nenhum espaço encontrado"
        description="Crie seu primeiro espaço para começar a gerenciar eventos"
        actionText="Criar Espaço"
        onAction={onCreateClick}
      />
    );
  }
  console.log(venues)
  return (
    <FilterList
      items={venues}
      filterBy={(venue, query) =>
        venue.name.toLowerCase().includes(query.toLowerCase())
      }
      placeholder="Buscar espaço..."
    >
      {(filtered) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((venue) => (
            <VenueCard
              key={venue.id}
              id={venue.id}
              name={venue.name}
              nextEvent={venue?.DateEvent?.[0] as DateEvent || null}
              upcomingEvents={venue?._count?.DateEvent || 0}
              organizationId={organizationId}
              onEditClick={() => onEditClick?.(venue.id)}
            />
          ))}
        </div>
      )}
    </FilterList>
  );
} 