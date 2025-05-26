import { useQuery } from '@tanstack/react-query';
import { attachmentService } from '@/services/attachments.service';
export const useGetAttachmentsList = (organizationId: string) => {
  return useQuery({
    queryKey: ['attachments', organizationId],
    queryFn: () => attachmentService.getAttachmentsList(organizationId),
    select: (data) => data.data.attachmentList,
  });
};
