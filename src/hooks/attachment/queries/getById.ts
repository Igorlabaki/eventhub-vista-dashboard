import { useQuery } from '@tanstack/react-query';
import { attachmentService } from '@/services/attachments.service';

export const useGetAttachmentById = (attachmentId : string) => {
  return useQuery({
    queryKey: ['attachments', attachmentId],
    queryFn: () => attachmentService.getAttachmentById(attachmentId),
    select: (data) => data.data.attachment,
    enabled: !!attachmentId,
  });
}; 