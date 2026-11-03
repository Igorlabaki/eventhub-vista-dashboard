import { api } from "@/lib/axios";
import {
  CreateMinimumPricePeriodDTO,
  MinimumPricePeriodListResponse,
  MinimumPricePeriodMutationResponse,
  UpdateMinimumPricePeriodDTO,
} from "@/types/minimumPricePeriod";

export const minimumPricePeriodService = {
  list: async (venueId: string) => {
    const response = await api.get<MinimumPricePeriodListResponse>(`/minimumPricePeriod/list/${venueId}`);
    return response.data;
  },

  create: async (data: CreateMinimumPricePeriodDTO) => {
    const response = await api.post<MinimumPricePeriodMutationResponse>("/minimumPricePeriod/create", data);
    return response.data;
  },

  update: async (data: UpdateMinimumPricePeriodDTO) => {
    const response = await api.put<MinimumPricePeriodMutationResponse>("/minimumPricePeriod/update", data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<MinimumPricePeriodMutationResponse>(`/minimumPricePeriod/delete/${id}`);
    return response.data;
  },
};
