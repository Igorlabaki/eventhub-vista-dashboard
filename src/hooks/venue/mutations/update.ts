import { useQueryClient } from '@tanstack/react-query';
import { venueService } from '@/services/venue.service';
import { CreateVenueDTO } from '@/types/venue';
import { useMutationWithError } from '@/hooks/useMutationWithError';

export const useUpdateVenueMutations = (userId: string) => {
  const queryClient = useQueryClient();

  const updateVenue = useMutationWithError<unknown, { venueId: string; data: Partial<CreateVenueDTO> }>(
    ({ venueId, data }) => venueService.updateVenue(venueId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['venues', userId] });
      }
    }
  );

  return {
    updateVenue,
  };
}; 