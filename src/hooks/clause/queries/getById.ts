import { clauseService } from '@/services/clause.service';
import { useQuery } from '@tanstack/react-query';


export const useGetClauseById = (clauseId : string) => {
  return useQuery({
    queryKey: ['clauses', clauseId],
    queryFn: () => clauseService.getClauseById(clauseId),
    select: (data) => data.data.clause,
    enabled: !!clauseId,
  });
}; 