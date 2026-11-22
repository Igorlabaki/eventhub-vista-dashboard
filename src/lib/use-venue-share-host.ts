import { useEffect, useState } from "react";
import { shareHostOf } from "@/lib/public-venue-links";
import { venueService } from "@/services/venue.service";

export function useVenueShareHost(venueName?: string | null) {
  const [host, setHost] = useState<string | null>(null);
  useEffect(() => {
    const name = venueName?.trim();
    if (!name) {
      setHost(null);
      return;
    }
    let active = true;
    venueService.getVenueDomain(name).then((data) => {
      if (active) setHost(shareHostOf(data));
    }).catch(() => {
      if (active) setHost(null);
    });
    return () => {
      active = false;
    };
  }, [venueName]);
  return host;
}
