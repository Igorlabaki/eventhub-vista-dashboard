import { useQueryClient } from '@tanstack/react-query';
import { useMutationWithError } from '@/hooks/useMutationWithError';
import { userOrganizationService } from '@/services/user-organization.service';
import { UpdateUserOrganizationDTO } from '@/types/userOrganization';

export const useUpdateUserOrganizationMutations = () => {
  const queryClient = useQueryClient();

  const updateUserOrganization = useMutationWithError<unknown, { userOrganizationId: string; data: Partial<UpdateUserOrganizationDTO> }>(
    ({ userOrganizationId, data }) => userOrganizationService.updateUserOrganization(userOrganizationId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      }
    }
  );

  return {
    updateUserOrganization,
  };
}; 