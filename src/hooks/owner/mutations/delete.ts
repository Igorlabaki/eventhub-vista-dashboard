import { useQueryClient } from '@tanstack/react-query';
import { ownerService } from '@/services/owner.service';
import { useMutationWithError } from '@/hooks/useMutationWithError';

export const useDeleteOwnerMutations = (userId: string) => {
  const queryClient = useQueryClient();

  const deleteOwner = useMutationWithError<unknown, string>(
    ownerService.deleteOwner,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['organization-owners', userId] });
      }
    }
  );

  return {
    deleteOwner,
  };
}; 