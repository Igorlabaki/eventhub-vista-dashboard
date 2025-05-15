import { useQueryClient } from '@tanstack/react-query';
import { organizationService } from '@/services/organization.service';
import { CreateOrganizationDTO } from '@/types/organization';
import { useMutationWithError } from '@/hooks/useMutationWithError';

export const useUpdateOrganizationMutations = (userId: string) => {
  const queryClient = useQueryClient();

  const updateOrganization = useMutationWithError<unknown, { organizationId: string; data: Partial<CreateOrganizationDTO> }>(
    ({ organizationId, data }) => organizationService.updateOrganization(organizationId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['organizations', userId] });
      }
    }
  );

  return {
    updateOrganization,
  };
}; 