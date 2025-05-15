import { ownerService } from '@/services/owner.service';
import { useQuery } from '@tanstack/react-query';


export const useGetOwnerById = (ownerId : string) => {
  return useQuery({
    queryKey: ['owner', ownerId],
    queryFn: () => ownerService.getOwnerById(ownerId),
    select: (data) => data.data.owner,
    enabled: !!ownerId,
  });
}; 