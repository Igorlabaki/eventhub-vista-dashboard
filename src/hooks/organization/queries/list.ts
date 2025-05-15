import { organizationService } from '@/services/organization.service';
import { useQuery } from '@tanstack/react-query';

export const useGetOrganizationsList = (userId: string) => {
  return useQuery({
    queryKey: ['organizations', userId],
    queryFn: () => organizationService.getAllOrganizations(userId),
    select: (data) => data.data.organizationList,
  });
};
