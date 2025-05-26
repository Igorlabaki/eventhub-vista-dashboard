import { useQueryClient } from '@tanstack/react-query';
import { useMutationWithError } from '@/hooks/useMutationWithError';
import { attachmentService } from '@/services/attachments.service';

export const useDeleteAttachmentMutations = (userId: string) => {
  const queryClient = useQueryClient();

  const deleteAttachment = useMutationWithError<unknown, string>(
    attachmentService.deleteAttachment,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['attachments', userId] });
      }
    }
  );

  return {
    deleteAttachment,
  };
}; 