import { goalService } from '@/services/goal.service';
import { useQuery } from '@tanstack/react-query';

interface UseGetGoalsParams {
    venueId?: string;
    minValue?: number;
}

export const useGetGoals = (params?: UseGetGoalsParams) => {
    return useQuery({
        queryKey: ['goals', params],
        queryFn: () => goalService.getAllGoals(params?.venueId, params?.minValue),
        select: (response) => response.data.goalList,
    });
}; 