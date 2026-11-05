import { useEffect, useState } from "react";
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

  const venue = selectedVenue?.id === venueId ? selectedVenue : null;
  const contentReady = listReady && (!venueId || settledVenueId === venueId);
  return { venue, contentReady };
}
