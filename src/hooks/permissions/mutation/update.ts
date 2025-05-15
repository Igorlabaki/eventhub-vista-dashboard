import { useQueryClient } from '@tanstack/react-query';

import { useMutationWithError } from '@/hooks/useMutationWithError';
import { userPermissionService } from '@/services/userpermissions.service';
import { UpdateUserPermissionDTO } from '@/types/userPermissions';

export const useUpdateUserPermissionMutations = ( organizationId: string ) => {
  const queryClient = useQueryClient();

  const updateUserPermission = useMutationWithError<unknown, UpdateUserPermissionDTO>(
    ( data ) => userPermissionService.updateUserPermission(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user-organizations', organizationId] });
      }
    }
  );

  return {
    updateUserPermission,
  };
}; 