import { useQueryClient } from '@tanstack/react-query';
import { useMutationWithError } from '@/hooks/useMutationWithError';
import { contractService } from '@/services/contract.service';
import { CreateContractDTO } from '@/types/contract';

export const useCreateContractMutations = (organizationId: string) => {
  const queryClient = useQueryClient();

  const createContract = useMutationWithError<unknown, CreateContractDTO>(
    contractService.createContract,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contracts', organizationId] });
      }
    }
  );

  return { createContract };
};
