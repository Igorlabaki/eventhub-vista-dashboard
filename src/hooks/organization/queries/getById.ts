import { organizationService } from '@/services/organization.service';
import { useQuery } from '@tanstack/react-query';


export const useGetOrganizationById = (organizationId : string) => {
  return useQuery({
    queryKey: ['organizations', organizationId],
    queryFn: () => organizationService.getOrganizationById(organizationId),
    select: (data) => data.data.organization,
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}; 