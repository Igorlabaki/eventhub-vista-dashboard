import { useEffect, useState } from "react";
import { venueService } from "@/services/venue.service";
import { AnalysisData } from "@/types/venue";

export function useAnalysisYear(venueId: string | undefined, year: string, approved?: boolean) {
  const [data, setData] = useState<AnalysisData | null>(null);

  useEffect(() => {
    if (!venueId || !year) return;
    let active = true;
    setData(null);
    venueService.getVenueAnalysisByMonth({ venueId, year, approved })
      .then((response) => {
        if (active) setData(response.data);
      })
      .catch(() => {
        if (active) setData(null);
      });
    return () => {
      active = false;
    };
  }, [venueId, year, approved]);

  return data;
}
