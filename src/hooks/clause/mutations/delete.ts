import { useQueryClient } from '@tanstack/react-query';
import { clauseService } from '@/services/clause.service';
import { useMutationWithError } from '@/hooks/useMutationWithError';

export const useDeleteClauseMutations = (organizationId: string) => {
  const queryClient = useQueryClient();

  const deleteClause = useMutationWithError<unknown, string>(
    clauseService.deleteClause,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['clauses', organizationId] });
      }
    }
  );

  return {
    deleteClause,
  };
}; 