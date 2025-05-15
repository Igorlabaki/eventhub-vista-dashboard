import { venueService } from '@/services/venue.service';
import { useQuery } from '@tanstack/react-query';

export const useGetVenuesList = (organizationId: string) => {
  return useQuery({
    queryKey: ['venues', organizationId],
    queryFn: () => venueService.getAllVenues(organizationId),
    select: (response) => response.data.venueList,
  });
};
