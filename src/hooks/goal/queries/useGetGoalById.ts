import { goalService } from '@/services/goal.service';
import { useQuery } from '@tanstack/react-query';

export const useGetGoalById = (goalId: string) => {
    return useQuery({
        queryKey: ['goal', goalId],
        queryFn: () => goalService.getGoalById(goalId),
        select: (response) => response.data.goal,
        enabled: !!goalId,
    });
}; 