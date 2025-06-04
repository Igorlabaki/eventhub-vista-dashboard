import { create } from 'zustand';
import {
  SeasonalFee,
  SeasonalFeeListResponse,
  SeasonalFeeByIdResponse,
  SeasonalFeeCreateResponse,
  SeasonalFeeDeleteResponse,
  SeasonalFeeUpdateResponse,
  CreateSeasonalFeeDTO,
  UpdateSeasonalFeeDTO
} from '@/types/seasonalFee';
import { seasonalFeeService } from '@/services/seasonalFee.service';

interface SeasonalFeeStore {
  surcharges: SeasonalFee[];
  discounts: SeasonalFee[];
  currentSeasonalFee: SeasonalFee | null;
  isLoading: boolean;
  error: string | null;
  setSurcharges: (surcharges: SeasonalFee[]) => void;
  setDiscounts: (discounts: SeasonalFee[]) => void;
  setCurrentSeasonalFee: (seasonalFee: SeasonalFee | null) => void;
  fetchSurcharges: (venueId: string) => Promise<void>;
  fetchDiscounts: (venueId: string) => Promise<void>;
  fetchSeasonalFeeById: (seasonalFeeId: string) => Promise<void>;
  createSeasonalFee: (data: CreateSeasonalFeeDTO) => Promise<SeasonalFeeCreateResponse>;
  updateSeasonalFee: (data: UpdateSeasonalFeeDTO) => Promise<SeasonalFeeUpdateResponse>;
  deleteSeasonalFee: (seasonalFeeId: string, type: 'SURCHARGE' | 'DISCOUNT') => Promise<SeasonalFeeDeleteResponse>;
  addSeasonalFee: (seasonalFee: SeasonalFee, type: 'SURCHARGE' | 'DISCOUNT') => void;
  updateSeasonalFeeInStore: (seasonalFee: SeasonalFee) => void;
  removeSeasonalFee: (seasonalFeeId: string, type: 'SURCHARGE' | 'DISCOUNT') => void;
  clearError: () => void;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useSeasonalFeeStore = create<SeasonalFeeStore>((set, get) => ({
  surcharges: [],
  discounts: [],
  currentSeasonalFee: null,
  isLoading: false,
  error: null,

  setSurcharges: (surcharges) => set({ surcharges }),
  setDiscounts: (discounts) => set({ discounts }),
  setCurrentSeasonalFee: (seasonalFee) => set({ currentSeasonalFee: seasonalFee }),

  fetchSurcharges: async (venueId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await seasonalFeeService.getSeasonalFeesList(venueId, 'SURCHARGE');
      set({ surcharges: response.data.seasonalfeeList });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Não foi possível carregar os adicionais.",
        surcharges: []
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDiscounts: async (venueId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await seasonalFeeService.getSeasonalFeesList(venueId, 'DISCOUNT');
      set({ discounts: response.data.seasonalfeeList });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Não foi possível carregar os descontos.",
        discounts: []
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSeasonalFeeById: async (seasonalFeeId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await seasonalFeeService.getSeasonalFeeById(seasonalFeeId);
      set({ currentSeasonalFee: response.data.seasonalFee });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Não foi possível carregar o adicional/desconto.",
        currentSeasonalFee: null
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createSeasonalFee: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await seasonalFeeService.createSeasonalFee(data);
      set((state) => {
        if (response.data.type === 'SURCHARGE') {
          return { surcharges: [...state.surcharges, response.data], isLoading: false };
        } else {
          return { discounts: [...state.discounts, response.data], isLoading: false };
        }
      });
      return response;
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Não foi possível criar o adicional/desconto.",
        isLoading: false
      });
      throw err;
    }
  },

  updateSeasonalFee: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await seasonalFeeService.updateSeasonalFee(data);
      set((state) => {
        if (response.data.type === 'SURCHARGE') {
          return {
            surcharges: state.surcharges.map((f) => f.id === data.seasonalFeeId ? response.data : f),
            currentSeasonalFee: state.currentSeasonalFee && state.currentSeasonalFee.id === data.seasonalFeeId ? response.data : state.currentSeasonalFee,
            isLoading: false
          };
        } else {
          return {
            discounts: state.discounts.map((f) => f.id === data.seasonalFeeId ? response.data : f),
            currentSeasonalFee: state.currentSeasonalFee && state.currentSeasonalFee.id === data.seasonalFeeId ? response.data : state.currentSeasonalFee,
            isLoading: false
          };
        }
      });
      return response;
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Não foi possível atualizar o adicional/desconto.",
        isLoading: false
      });
      throw err;
    }
  },

  deleteSeasonalFee: async (seasonalFeeId, type) => {
    set({ isLoading: true, error: null });
    try {
      const response = await seasonalFeeService.deleteSeasonalFee(seasonalFeeId);
      set((state) => (
        type === 'SURCHARGE'
          ? {
              surcharges: state.surcharges.filter((f) => f.id !== seasonalFeeId),
              currentSeasonalFee: state.currentSeasonalFee && state.currentSeasonalFee.id === seasonalFeeId ? null : state.currentSeasonalFee,
              isLoading: false
            }
          : {
              discounts: state.discounts.filter((f) => f.id !== seasonalFeeId),
              currentSeasonalFee: state.currentSeasonalFee && state.currentSeasonalFee.id === seasonalFeeId ? null : state.currentSeasonalFee,
              isLoading: false
            }
      ));
      return response;
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Não foi possível excluir o adicional/desconto.",
        isLoading: false
      });
      throw err;
    }
  },

  addSeasonalFee: (seasonalFee, type) => set((state) => (
    type === 'SURCHARGE'
      ? { surcharges: [...state.surcharges, seasonalFee] }
      : { discounts: [...state.discounts, seasonalFee] }
  )),

  updateSeasonalFeeInStore: (seasonalFee) => set((state) => {
    if (seasonalFee.type === 'SURCHARGE') {
      return {
        surcharges: state.surcharges.map((f) => f.id === seasonalFee.id ? seasonalFee : f),
        currentSeasonalFee: state.currentSeasonalFee && state.currentSeasonalFee.id === seasonalFee.id ? seasonalFee : state.currentSeasonalFee,
      };
    } else {
      return {
        discounts: state.discounts.map((f) => f.id === seasonalFee.id ? seasonalFee : f),
        currentSeasonalFee: state.currentSeasonalFee && state.currentSeasonalFee.id === seasonalFee.id ? seasonalFee : state.currentSeasonalFee,
      };
    }
  }),

  removeSeasonalFee: (seasonalFeeId, type) => set((state) => (
    type === 'SURCHARGE'
      ? {
          surcharges: state.surcharges.filter((f) => f.id !== seasonalFeeId),
          currentSeasonalFee: state.currentSeasonalFee && state.currentSeasonalFee.id === seasonalFeeId ? null : state.currentSeasonalFee,
        }
      : {
          discounts: state.discounts.filter((f) => f.id !== seasonalFeeId),
          currentSeasonalFee: state.currentSeasonalFee && state.currentSeasonalFee.id === seasonalFeeId ? null : state.currentSeasonalFee,
        }
  )),

  clearError: () => set({ error: null }),
})); 