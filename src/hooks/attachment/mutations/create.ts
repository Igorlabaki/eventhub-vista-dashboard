import { useQueryClient } from '@tanstack/react-query';
import { useMutationWithError } from '@/hooks/useMutationWithError';
import { CreateAttachmentDTO } from '@/types/attachment';
import { attachmentService } from '@/services/attachments.service';

export const useCreateAttachmentMutations = (userId: string) => {
  const queryClient = useQueryClient();

  const createAttachment = useMutationWithError<unknown, CreateAttachmentDTO>(
    attachmentService.createAttachment,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['attachments', userId] });
      }
    }
  );

  return { createAttachment };
};
