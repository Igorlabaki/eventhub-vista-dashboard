import { useEffect, useState } from "react";
import { shareHostOf } from "@/lib/public-venue-links";
import { venueService } from "@/services/venue.service";

const shareHostListeners = new Set<() => void>();

export function notifyVenueShareHostChanged() {
  shareHostListeners.forEach((listener) => listener());
}

export function subscribeVenueShareHost(listener: () => void) {
  shareHostListeners.add(listener);
  return () => {
    shareHostListeners.delete(listener);
  };
}

export function useVenueShareHost(venueName?: string | null) {
  const [host, setHost] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  useEffect(() => subscribeVenueShareHost(() => setRevision((current) => current + 1)), []);
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
  }, [venueName, revision]);
  return host;
}
