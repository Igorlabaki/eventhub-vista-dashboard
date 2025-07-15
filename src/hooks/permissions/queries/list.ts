import { userPermissionService } from '@/services/userVenuePermissions.service';
import { useQuery } from '@tanstack/react-query';

export const useGetOrganizationUserPermissionsList = (organizationId: string) => {
  return useQuery({
    queryKey: ['user-permissions', organizationId],
    queryFn: () => userPermissionService.getAllUserPermissions(organizationId),
    select: (response) => response.data.userPermissionList,
  });
};
