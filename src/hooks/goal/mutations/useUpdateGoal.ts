import { UpdateGoalDTO } from '@/types/goal';
import { goalService } from '@/services/goal.service';
import { useMutationWithError } from '@/hooks/useMutationWithError';
import { useQueryClient } from '@tanstack/react-query';

export const useUpdateGoal = () => {
    const queryClient = useQueryClient();

    return useMutationWithError(
        ({ goalId, data }: UpdateGoalDTO) => goalService.updateGoal(goalId, data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['goals'] });
            },
        }
    );
}; 