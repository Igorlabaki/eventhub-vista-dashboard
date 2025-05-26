import { api } from '@/lib/axios';
import { CreateAttachmentDTO, AttachmentListResponse, AttachmentByIdResponse, AttachmentUpdateResponse, AttachmentCreateResponse, AttachmentDeleteResponse, UpdateAttachmentDTO } from '@/types/attachment';

export const attachmentService = {
  createAttachment: async (data: CreateAttachmentDTO) => {
    const response = await api.post<AttachmentCreateResponse>('/attachment/create', data);
    return response.data;
  },

  getAttachmentsList: async (organizationId: string) => {
    const response = await api.get<AttachmentListResponse>(`/attachment/list?organizationId=${organizationId}`);
    return response.data;
  },

  getAttachmentById: async (attachmentId: string) => {
    const response = await api.get<AttachmentByIdResponse>(`/attachment/getById?attachmentId=${attachmentId}`);
    return response.data;
  },

  updateAttachment: async (data: Partial<UpdateAttachmentDTO>) => {
    const response = await api.put<AttachmentUpdateResponse>(`/attachment/update`,  data );
    return response.data;
  },

  deleteAttachment: async (id: string) => {
    const response = await api.delete<AttachmentDeleteResponse>(`/attachment/delete/${id}`);
    return response.data;
  }
}; 