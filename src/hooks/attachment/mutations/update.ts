import { useQueryClient } from '@tanstack/react-query';
import { UpdateAttachmentDTO } from '@/types/attachment';
import { useMutationWithError } from '@/hooks/useMutationWithError';
import { attachmentService } from '@/services/attachments.service';

export const useUpdateAttachmentMutations = (userId: string) => {
  const queryClient = useQueryClient();

  const updateAttachment = useMutationWithError<unknown, UpdateAttachmentDTO>(
    (dto) => attachmentService.updateAttachment(dto),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['attachments', userId] });
      }
    }
  );

  return {
    updateAttachment,
  };
}; 