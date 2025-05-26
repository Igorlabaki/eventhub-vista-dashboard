import { contractService } from '@/services/contract.service';
import { useQuery } from '@tanstack/react-query';


export const useGetContractById = (contractId : string) => {
  return useQuery({
    queryKey: ['contract', contractId],
    queryFn: () => contractService.getContractById(contractId),
    select: (data) => data.data.contract,
    enabled: !!contractId,
  });
}; 