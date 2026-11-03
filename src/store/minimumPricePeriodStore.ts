import { create } from "zustand";
import {
  CreateMinimumPricePeriodDTO,
  MinimumPricePeriod,
  MinimumPricePeriodMutationResponse,
  UpdateMinimumPricePeriodDTO,
} from "@/types/minimumPricePeriod";
import { minimumPricePeriodService } from "@/services/minimumPricePeriod.service";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface MinimumPricePeriodStore {
  periods: MinimumPricePeriod[];
  isLoading: boolean;
  error: string | null;
  fetchPeriods: (venueId: string) => Promise<void>;
  createPeriod: (data: CreateMinimumPricePeriodDTO) => Promise<MinimumPricePeriodMutationResponse>;
  updatePeriod: (data: UpdateMinimumPricePeriodDTO) => Promise<MinimumPricePeriodMutationResponse>;
  deletePeriod: (id: string) => Promise<MinimumPricePeriodMutationResponse>;
}

export const useMinimumPricePeriodStore = create<MinimumPricePeriodStore>((set) => ({
  periods: [],
  isLoading: false,
  error: null,

  fetchPeriods: async (venueId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await minimumPricePeriodService.list(venueId);
      set({ periods: response.data.minimumPricePeriodList, isLoading: false });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Não foi possível carregar as faixas de preço mínimo.",
        periods: [],
        isLoading: false,
      });
    }
  },

  createPeriod: async (data) => {
    const response = await minimumPricePeriodService.create(data);
    set((state) => ({ periods: [...state.periods, response.data] }));
    return response;
  },

  updatePeriod: async (data) => {
    const response = await minimumPricePeriodService.update(data);
    set((state) => ({
      periods: state.periods.map((period) => (period.id === response.data.id ? response.data : period)),
    }));
    return response;
  },

  deletePeriod: async (id) => {
    const response = await minimumPricePeriodService.delete(id);
    set((state) => ({ periods: state.periods.filter((period) => period.id !== id) }));
    return response;
  },
}));
