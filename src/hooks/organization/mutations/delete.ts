import { useQueryClient } from '@tanstack/react-query';
import { organizationService } from '@/services/organization.service';
import { useMutationWithError } from '@/hooks/useMutationWithError';

export const useDeleteOrganizationMutations = (userId: string) => {
  const queryClient = useQueryClient();

  const deleteOrganization = useMutationWithError<unknown, string>(
    organizationService.deleteOrganization,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['organizations', userId] });
      }
    }
  );

  return {
    deleteOrganization,
  };
}; 