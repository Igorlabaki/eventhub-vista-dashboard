import { contractService } from '@/services/contract.service';
import { useQuery } from '@tanstack/react-query';

export const useGetContractsList = (organizationId: string) => {
  return useQuery({
    queryKey: ['contracts', organizationId],
    queryFn: () => contractService.getContractsList(organizationId),
    select: (data) => data.data.contractList,
  });
};
