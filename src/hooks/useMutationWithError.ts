import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { useErrorHandler } from './useErrorHandler';

export function useMutationWithError<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, unknown, TVariables>, 'mutationFn'>
): UseMutationResult<TData, unknown, TVariables> {
  const { toast } = useToast();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn,
    ...options,
    onError: (error, variables, context) => {
      handleError(error);
      options?.onError?.(error, variables, context);
    },
  });
} 