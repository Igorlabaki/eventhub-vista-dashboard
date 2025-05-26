import { useQueryClient } from '@tanstack/react-query';
import { useMutationWithError } from '@/hooks/useMutationWithError';
import { clauseService } from '@/services/clause.service';
import { CreateClauseDTO } from '@/types/clause';

export const useCreateClauseMutations = (organizationId: string) => {
  const queryClient = useQueryClient();

  const createClause = useMutationWithError<unknown, CreateClauseDTO>(
    clauseService.createClause,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['clauses', organizationId] });
      }
    }
  );

  return { createClause };
};
