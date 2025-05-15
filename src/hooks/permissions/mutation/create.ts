import { useQueryClient } from '@tanstack/react-query';
import { useMutationWithError } from '@/hooks/useMutationWithError';
import { userPermissionService } from '@/services/userpermissions.service';
import { CreateUserPermissionDTO } from '@/types';

export const useCreateUserPermissionMutations = ( userOrganizationId: string) => {
  const queryClient = useQueryClient();

  const createUserPermission = useMutationWithError<unknown, CreateUserPermissionDTO>(
    userPermissionService.createUserPermission,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user-organizations', userOrganizationId] });
      }
    }
  );

  return { createUserPermission };
};

