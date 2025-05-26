import { goalService } from '@/services/goal.service';
import { useMutationWithError } from '@/hooks/useMutationWithError';
import { useQueryClient } from '@tanstack/react-query';

export const useDeleteGoal = () => {
    const queryClient = useQueryClient();

    return useMutationWithError(
        (goalId: string) => goalService.deleteGoal(goalId),
        {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['goals'] });
            },
        }
    );
}; 