import { CreateGoalDTO } from '@/types/goal';
import { goalService } from '@/services/goal.service';
import { useMutationWithError } from '@/hooks/useMutationWithError';
import { useQueryClient } from '@tanstack/react-query';

export const useCreateGoal = () => {
    const queryClient = useQueryClient();

    return useMutationWithError(
        (data: CreateGoalDTO) => goalService.createGoal(data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['goals'] });
            },
        }
    );
}; 