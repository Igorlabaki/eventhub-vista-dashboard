import { api } from '@/lib/axios';
import { 
  CreateDateEventDTO, 
  DateEventListResponse, 
  DateEventByIdResponse, 
  DateEventUpdateResponse, 
  DateEventCreateResponse, 
  DateEventDeleteResponse 
} from '@/types/dateEvent';

export const dateEventService = {
  createSameDayEvent: async (data: CreateDateEventDTO) => {
    const response = await api.post<DateEventCreateResponse>('/dateEvent/createSameDay', data);
    return response.data;
  },

  createOvernightEvent: async (data: CreateDateEventDTO) => {
    const response = await api.post<DateEventCreateResponse>('/dateEvent/createOvernigth', data);
    return response.data;
  },

  getAllDateEvents: async (venueId?: string, proposalId?: string) => {
    const response = await api.get<DateEventListResponse>(`/dateEvent/list?venueId=${venueId || ''}&proposalId=${proposalId || ''}`);
    return response.data;
  },

  updateSameDayEvent: async (data: CreateDateEventDTO) => {
    const response = await api.post<DateEventUpdateResponse>('/dateEvent/updateSameDay', data);
    return response.data;
  },

  updateOvernightEvent: async (data: CreateDateEventDTO) => {
    const response = await api.post<DateEventUpdateResponse>('/dateEvent/updateOverNight', data);
    return response.data;
  },

  deleteDateEvent: async (id: string) => {
    const response = await api.delete<DateEventDeleteResponse>(`/dateEvent/delete/${id}`);
    return response.data;
  }
}; 