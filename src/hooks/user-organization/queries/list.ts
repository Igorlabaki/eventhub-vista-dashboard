import { useQuery } from '@tanstack/react-query';
import { userOrganizationService } from '@/services/user-organization.service';

export const useGetUserOrganizationOwnersList = (organizationId: string) => {
  return useQuery({
    queryKey: ['user-organizations', organizationId],
    queryFn: () => userOrganizationService.getAllUserOrganizations(organizationId),
    select: (response) => response.data.userOrganizationByOrganizationList,
  });
};
