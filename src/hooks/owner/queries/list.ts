import { ownerService } from '@/services/owner.service';
import { ListOwnerByVenueIdQuerySchema } from '@/types/owner';
import { useQuery } from '@tanstack/react-query';

export const useGetOrganizationOwnersList = (organizationId: string) => {
  return useQuery({
    queryKey: ['organization-owners', organizationId],
    queryFn: () => ownerService.getAllOrganizationOwners(organizationId),
    select: (data) => data.data.ownerByOrganizationList,
  });
};

export const useGetVenueOwnersList = (params: ListOwnerByVenueIdQuerySchema) => {
  return useQuery({
    queryKey: ['venue-owners', params],
    queryFn: () => ownerService.getOwnersByVenueId(params),
    select: (data) => data.data.ownerByOrganizationList,
  });
}