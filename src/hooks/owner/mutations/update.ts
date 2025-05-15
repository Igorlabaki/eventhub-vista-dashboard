import { useQueryClient } from '@tanstack/react-query';
import { ownerService } from '@/services/owner.service';
import { CreateOwnerDTO } from '@/types/owner';
import { useMutationWithError } from '@/hooks/useMutationWithError';

export const useUpdateOwnerMutations = (organizationId: string) => {
  const queryClient = useQueryClient();

  const updateOwner = useMutationWithError<unknown, { ownerId: string; data: Partial<CreateOwnerDTO> }>(
    ({ ownerId, data }) => ownerService.updateOwner(ownerId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['venue-owners', organizationId] });
        queryClient.invalidateQueries({ queryKey: ['organization-owners', organizationId] });
      }
    }
  );

  return {
    updateOwner,
  };
}; 