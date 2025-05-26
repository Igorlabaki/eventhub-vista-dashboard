import { useQueryClient } from '@tanstack/react-query';
import { clauseService } from '@/services/clause.service';
import { CreateClauseDTO, UpdateClauseDTO } from '@/types/clause';
import { useMutationWithError } from '@/hooks/useMutationWithError';

export const useUpdateClauseMutations = (organizationId: string) => {
  const queryClient = useQueryClient();

  const updateClause = useMutationWithError<unknown, Partial<UpdateClauseDTO> >(
    ( data ) => clauseService.updateClause(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['clauses', organizationId] });
      }
    }
  );

  return {
    updateClause,
  };
}; 