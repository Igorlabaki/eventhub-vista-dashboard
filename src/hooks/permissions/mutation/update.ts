import { useQueryClient } from '@tanstack/react-query';

import { useMutationWithError } from '@/hooks/useMutationWithError';
import { userPermissionService } from '@/services/userVenuePermissions.service';
import { UpdateUserPermissionDTO } from '@/types/userVenuePermissions';

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