import { useQueryClient } from '@tanstack/react-query';
import { useMutationWithError } from '@/hooks/useMutationWithError';
import { userPermissionService } from '@/services/userVenuePermissions.service';

export const useDeleteUserPermissionMutations = (userId: string) => {
  const queryClient = useQueryClient();

  const deleteUserPermission = useMutationWithError<unknown, string>(
    userPermissionService.deleteUserPermission,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user-organizations', userId] });
      }
    }
  );

  return {
    deleteUserPermission,
  };
}; 