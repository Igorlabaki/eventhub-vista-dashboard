import { useQueryClient } from '@tanstack/react-query';
import { useMutationWithError } from '@/hooks/useMutationWithError';
import { CreateUserOrganizationDTO } from '@/types/userOrganization';
import { userOrganizationService } from '@/services/user-organization.service';

export const useCreateUserOrganizationMutations = (organizationId: string) => {
  const queryClient = useQueryClient();

  const createUserOrganization = useMutationWithError<unknown, CreateUserOrganizationDTO>(
    userOrganizationService.createUserOrganization,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user-organizations', organizationId] });
      }
    }
  );

  return { createUserOrganization };
};

