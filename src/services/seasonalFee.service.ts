import { api } from '@/lib/axios';
import {
  CreateSeasonalFeeDTO,
  SeasonalFeeListResponse,
  SeasonalFeeByIdResponse,
  SeasonalFeeUpdateResponse,
  SeasonalFeeCreateResponse,
  SeasonalFeeDeleteResponse,
  UpdateSeasonalFeeDTO
} from '@/types/seasonalFee';

export const seasonalFeeService = {
  createSeasonalFee: async (data: CreateSeasonalFeeDTO) => {
    const response = await api.post<SeasonalFeeCreateResponse>('/seasonalFee/create', data);
    return response.data;
  },

  getSeasonalFeesList: async (venueId: string, title?: string) => {
    const url = title ? `/seasonalFee/list?venueId=${venueId}&type=${title}` : `/seasonalFee/list?venueId=${venueId}`;
    const response = await api.get<SeasonalFeeListResponse>(url);
    return response.data;
  },

  getSeasonalFeeById: async (seasonalFeeId: string) => {
    const response = await api.get<SeasonalFeeByIdResponse>(`/seasonalFee/getById/${seasonalFeeId}`);
    return response.data;
  },

  updateSeasonalFee: async (data: UpdateSeasonalFeeDTO) => {
    const response = await api.put<SeasonalFeeUpdateResponse>(`/seasonalFee/update`, data);
    return response.data;
  },

  deleteSeasonalFee: async (seasonalFeeId: string) => {
    const response = await api.delete<SeasonalFeeDeleteResponse>(`/seasonalFee/delete/${seasonalFeeId}`);
    return response.data;
  }
}; 