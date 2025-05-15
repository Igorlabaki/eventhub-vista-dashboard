import { useQueryClient } from '@tanstack/react-query';
import { useMutationWithError } from '@/hooks/useMutationWithError';
import { CreateVenueDTO } from '@/types/venue';
import { venueService } from '@/services/venue.service';


export const useCreateVenueMutations = (userId: string) => {
  const queryClient = useQueryClient();

  const createVenue = useMutationWithError<unknown, CreateVenueDTO>(
    venueService.createVenue,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['venues', userId] });
      }
    }
  );

  return { createVenue };
};
