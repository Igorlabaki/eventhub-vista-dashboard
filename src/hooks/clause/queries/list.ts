import { clauseService } from '@/services/clause.service';
import { useQuery } from '@tanstack/react-query';

export const useGetClausesList = (organizationId: string) => {
  return useQuery({
    queryKey: ['clauses', organizationId],
    queryFn: () => clauseService.getClausesList(organizationId),
    select: (data) => data.data.clauseList,
  });
};
