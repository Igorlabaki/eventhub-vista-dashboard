import { venueService } from '@/services/venue.service';
import { useQuery } from '@tanstack/react-query';


export const useGetVenueById = (id: string) => {
  return useQuery({
    queryKey: ['venues', id],
    queryFn: () => venueService.getVenueById(id),
    select: (response) => response.data,
    enabled: !!id,
  });
}; 