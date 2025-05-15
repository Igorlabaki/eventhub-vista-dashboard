import { useQueryClient } from '@tanstack/react-query';
import { useMutationWithError } from '@/hooks/useMutationWithError';
import { userOrganizationService } from '@/services/user-organization.service';

export const useDeleteUserOrganizationMutations = (organizationId: string) => {
  const queryClient = useQueryClient();

  const deleteUserOrganization = useMutationWithError<unknown, string>(
    userOrganizationService.deleteUserOrganization,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user-permissions', organizationId] });
      }
    }
  );

  return {
    deleteUserOrganization,
  };
}; 