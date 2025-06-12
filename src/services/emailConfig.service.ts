import { api } from '@/lib/axios';
import {
  CreateEmailConfigDTO,
  EmailConfigListResponse,
  EmailConfigByIdResponse,
  EmailConfigUpdateResponse,
  EmailConfigCreateResponse,
  EmailConfigDeleteResponse,
  UpdateEmailConfigDTO
} from '@/types/emailConfig';

export type CreateEmailConfigWithFileDTO = Omit<CreateEmailConfigDTO, 'backgroundImageUrl'> & {
  file?: File;
};

export type UpdateEmailConfigWithFileDTO = Omit<UpdateEmailConfigDTO, 'data'> & {
  data: Omit<UpdateEmailConfigDTO['data'], 'backgroundImageUrl'> & {
    file?: File;
  };
};

export const emailConfigService = {
  createEmailConfig: async (data: CreateEmailConfigWithFileDTO) => {
    const formData = new FormData();
  
    formData.append('title', data.title || '');
    formData.append('type', data.type);
    formData.append('message', data.message || '');
    formData.append('venueId', data.venueId);
    if (data.file) {
      formData.append('file', data.file, data.file.name);
    }
    const response = await api.post<EmailConfigCreateResponse>('/emailConfig/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getEmailConfigsList: async (venueId: string, type?: 'PROPOSAL' | 'CONTRACT') => {
    const url = type ? `/emailConfig/list?venueId=${venueId}&type=${type}` : `/emailConfig/list?venueId=${venueId}`;
    const response = await api.get<EmailConfigListResponse>(url);
    return response.data;
  },

  getEmailConfigById: async (emailConfigId: string) => {
    const response = await api.get<EmailConfigByIdResponse>(`/emailConfig/getById/${emailConfigId}`);
    return response.data;
  },

  updateEmailConfig: async (data: UpdateEmailConfigWithFileDTO) => {
    const formData = new FormData();
    formData.append('emailConfigId', data.emailConfigId);
    formData.append('venueId', data.venueId);
    if (data.data.title) formData.append('title', data.data.title);
    if (data.data.type) formData.append('type', data.data.type);
    if (data.data.message) formData.append('message', data.data.message);
    if (data.data.file) {
      formData.append('file', data.data.file, data.data.file.name);
    }
    const response = await api.put<EmailConfigUpdateResponse>('/emailConfig/update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteEmailConfig: async (emailConfigId: string) => {
    const response = await api.delete<EmailConfigDeleteResponse>(`/emailConfig/delete/${emailConfigId}`);
    return response.data;
  },

  getEmailConfigByType: async (venueId: string, type: string) => {
    const response = await api.get(`/emailConfig/getByType?venueId=${venueId}&type=${type}`);
    return response.data;
  }
}; 