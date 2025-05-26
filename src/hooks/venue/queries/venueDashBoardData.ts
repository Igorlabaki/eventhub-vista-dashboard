import { venueService } from '@/services/venue.service';
import { useQuery } from '@tanstack/react-query';

interface VenueDashboardParams {
  month?: string;
  year?: string;
}

export const useGetVenueDashBoardData = (venueId: string, params?: VenueDashboardParams) => {
  return useQuery({
    queryKey: ['venueDashBoardData', venueId, params],
    queryFn: () => venueService.getVenueDashBoardData(venueId, params),
    select: (response) => response.data,
    enabled: !!venueId,
  });
}; 