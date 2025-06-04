import { api } from '@/lib/axios';
import { 
  CreateTextDTO, 
  UpdateTextDTO,
  ListTextParams,
  TextListResponse, 
  TextByIdResponse, 
  TextUpdateResponse, 
  TextCreateResponse, 
  TextDeleteResponse 
} from '@/types/text';

export const textService = {
  createText: async (data: CreateTextDTO) => {
    const response = await api.post<TextCreateResponse>('/text/create', data);
    return response.data;
  },

  getTextById: async (textId: string) => {
    const response = await api.get<TextByIdResponse>(`/text/byId/${textId}`);
    return response.data;
  },

  updateText: async (data: UpdateTextDTO) => {
    const response = await api.put<TextUpdateResponse>('/text/update', data);
    return response.data;
  },

  listTexts: async (params: ListTextParams) => {
    const queryParams = new URLSearchParams();
    if (params.venueId) queryParams.append('venueId', params.venueId);
    if (params.area) queryParams.append('area', params.area);

    const response = await api.get<TextListResponse>(`/text/list?${queryParams.toString()}`);
    return response.data;
  },

  deleteText: async (textId: string) => {
    const response = await api.delete<TextDeleteResponse>(`/text/delete/${textId}`);
    return response.data;
  }
}; 