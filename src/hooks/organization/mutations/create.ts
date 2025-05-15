import { useQueryClient } from '@tanstack/react-query';
import { useMutationWithError } from '@/hooks/useMutationWithError';
import { organizationService } from '@/services/organization.service';
import { CreateOrganizationDTO } from '@/types/organization';

export const useCreateOrganizationMutations = (userId: string) => {
  const queryClient = useQueryClient();

  const createOrganization = useMutationWithError<unknown, CreateOrganizationDTO>(
    organizationService.createOrganization,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['organizations', userId] });
      }
    }
  );

  return { createOrganization };
};
