import { useEffect, useState } from "react";
import { venueIdForPublicForm } from "@/lib/public-venue-presentation";
import { useVenueStore } from "@/store/venueStore";

export function usePublicListVenue(venueId: string | undefined, listReady: boolean) {
  const selectedVenue = useVenueStore((s) => s.selectedVenue);
  const fetchVenueById = useVenueStore((s) => s.fetchVenueById);
  const [settledVenueId, setSettledVenueId] = useState<string | null>(null);

  useEffect(() => {
    if (!venueId) return;
    let active = true;
    setSettledVenueId(null);
    fetchVenueById(venueId).finally(() => {
      if (active) setSettledVenueId(venueId);
    });
    return () => {
      active = false;
    };
  }, [venueId, fetchVenueById]);

  const resolvedVenueId = venueIdForPublicForm(venueId, selectedVenue);
  const venue = resolvedVenueId && selectedVenue?.id === resolvedVenueId ? selectedVenue : null;
  const contentReady = listReady && (!venueId || settledVenueId === venueId);
  return { venue, contentReady };
}
