import { create } from 'zustand';
import { 
  WebsiteAnalytics,
  ListAnalyticsParams
} from '@/types/analytics';
import { analyticsService } from '@/services/analytics.service';

interface AnalyticsStore {
  analytics: WebsiteAnalytics | null;
  isLoading: boolean;
  error: string | null;
  setAnalytics: (analytics: WebsiteAnalytics | null) => void;
  fetchAnalytics: (params: ListAnalyticsParams) => Promise<void>;
  clearError: () => void;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  analytics: null,
  isLoading: false,
  error: null,
  setAnalytics: (analytics) => set({ analytics }),
  
  fetchAnalytics: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await analyticsService.getAnalytics(params);
      set({ analytics: response.data });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar as métricas.",
        analytics: null 
      });
    } finally {
      set({ isLoading: false });
    }
  },
  
  clearError: () => set({ error: null }),
})); 