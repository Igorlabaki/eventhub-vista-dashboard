import { useQueryClient } from '@tanstack/react-query';
import { contractService } from '@/services/contract.service';
import { CreateContractDTO, UpdateContractDTO } from '@/types/contract';
import { useMutationWithError } from '@/hooks/useMutationWithError';

export const useUpdateContractMutations = (organizationId: string) => {
  const queryClient = useQueryClient();

  const updateContract = useMutationWithError<unknown, Partial<UpdateContractDTO> >(
    ( data ) => contractService.updateContract(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contracts', organizationId] });
      }
    }
  );

  return {
    updateContract,
  };
}; 