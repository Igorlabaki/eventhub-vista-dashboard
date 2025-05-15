import { useQueryClient } from '@tanstack/react-query';
import { venueService } from '@/services/venue.service';
import { useMutationWithError } from '@/hooks/useMutationWithError';

export const useDeleteVenueMutations = (userId: string) => {
  const queryClient = useQueryClient();

  const deleteVenue = useMutationWithError<unknown, string>(
    venueService.deleteVenue,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['venues', userId] });
      }
    }
  );

  return {
    deleteVenue,
  };
}; 