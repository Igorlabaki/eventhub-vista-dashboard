import { useQueryClient } from '@tanstack/react-query';
import { contractService } from '@/services/contract.service';
import { useMutationWithError } from '@/hooks/useMutationWithError';

export const useDeleteContractMutations = (organizationId: string) => {
  const queryClient = useQueryClient();

  const deleteContract = useMutationWithError<unknown, string>(
    contractService.deleteContract,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contracts', organizationId] });
      }
    }
  );

  return {
    deleteContract,
  };
}; 