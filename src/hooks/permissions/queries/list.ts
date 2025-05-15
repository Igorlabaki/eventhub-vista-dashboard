import { userPermissionService } from '@/services/userpermissions.service';
import { useQuery } from '@tanstack/react-query';

export const useGetOrganizationUserPermissionsList = (organizationId: string) => {
  return useQuery({
    queryKey: ['user-permissions', organizationId],
    queryFn: () => userPermissionService.getAllUserPermissions(organizationId),
    select: (response) => response.data.userPermissionList,
  });
};
