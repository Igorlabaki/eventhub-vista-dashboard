import { create } from "zustand";
import { venueService } from "@/services/venue.service";
import { 
  VenueAnalysisByMonthResponse,
  VenueTrafficCountResponse,
  GetVenueTrafficCountParams,
  AnalysisData,
  TrafficData
} from "@/types/venue";

interface CacheEntry {
  data: any;
  timestamp: number;
}

interface VenueReportsStore {
  monthlyEventsData: AnalysisData;
  monthlyBudgetsData: AnalysisData;
  trafficEventsData: TrafficData;
  trafficBudgetsData: TrafficData;
  analyticsData: AnalysisData;
  isLoading: boolean;
  error: string | null;
  cache: Record<string, CacheEntry>;
  fetchVenueReports: (params: GetVenueTrafficCountParams) => Promise<void>;
  fetchEventsData: (params: GetVenueTrafficCountParams) => Promise<void>;
  fetchBudgetsData: (params: GetVenueTrafficCountParams) => Promise<void>;
  fetchEventsTraffic: (params: GetVenueTrafficCountParams) => Promise<void>;
  fetchBudgetsTraffic: (params: GetVenueTrafficCountParams) => Promise<void>;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useVenueReportsStore = create<VenueReportsStore>((set, get) => ({
  monthlyEventsData: {
    total: { count: 0, total: 0, guestNumber: 0 },
    approved: { count: 0, total: 0, guestNumber: 0 },
    analysisEventsByMonth: [],
    analysisProposalByMonth: []
  },
  monthlyBudgetsData: {
    total: { count: 0, total: 0, guestNumber: 0 },
    approved: { count: 0, total: 0, guestNumber: 0 },
    analysisEventsByMonth: [],
    analysisProposalByMonth: []
  },
  trafficEventsData: {
    all: 0,
    sortedSources: []
  },
  trafficBudgetsData: {
    all: 0,
    sortedSources: []
  },
  analyticsData: {
    total: { count: 0, total: 0, guestNumber: 0 },
    approved: { count: 0, total: 0, guestNumber: 0 },
    analysisEventsByMonth: [],
    analysisProposalByMonth: []
  },
  isLoading: false,
  error: null,
  cache: {},

  fetchVenueReports: async ({ venueId, year, approved }) => {
    try {
      set({ isLoading: true, error: null });

      const [monthlyResponse, trafficResponse, analysisResponse] = await Promise.all([
        venueService.getVenueAnalysisByMonth({ venueId, year, approved }),
        venueService.getVenueTrafficCount({ venueId, year, approved }),
        venueService.getVenueAnalysisByMonth({ venueId, year, approved })
      ]);

      const currentState = get();

      set({
        monthlyEventsData: approved ? monthlyResponse.data : currentState.monthlyEventsData,
        monthlyBudgetsData: !approved ? monthlyResponse.data : currentState.monthlyBudgetsData,
        trafficEventsData: approved ? trafficResponse.data : currentState.trafficEventsData,
        trafficBudgetsData: !approved ? trafficResponse.data : currentState.trafficBudgetsData,
        analyticsData: analysisResponse.data,
        isLoading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao carregar relatórios',
        isLoading: false 
      });
    }
  },

  fetchEventsData: async ({ venueId, year, approved = true }) => {
    try {
      const currentState = get();
      const cacheKey = `events_${venueId}_${year}_${approved}`;
      const cachedData = currentState.cache[cacheKey];
      const now = Date.now();

      // Se tiver cache válido, usa ele
      if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
        console.log("Using cached events data");
        set({ monthlyEventsData: cachedData.data });
        return;
      }

      console.log("Fetching fresh events data");
      set({ isLoading: true, error: null });

      const response = await venueService.getVenueAnalysisByMonth({ 
        venueId, 
        year, 
        approved
      });

      // Atualiza o cache e o estado
      set({
        monthlyEventsData: response.data,
        cache: {
          ...currentState.cache,
          [cacheKey]: {
            data: response.data,
            timestamp: now
          }
        },
        isLoading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao carregar dados de eventos',
        isLoading: false 
      });
    }
  },

  fetchBudgetsData: async ({ venueId, year, approved = false }) => {
    try {
      const currentState = get();
      const cacheKey = `budgets_${venueId}_${year}_${approved}`;
      const cachedData = currentState.cache[cacheKey];
      const now = Date.now();

      // Se tiver cache válido, usa ele
      if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
        console.log("Using cached budgets data");
        set({ monthlyBudgetsData: cachedData.data });
        return;
      }

      console.log("Fetching fresh budgets data");
      set({ isLoading: true, error: null });

      const response = await venueService.getVenueAnalysisByMonth({ 
        venueId, 
        year, 
      });

      // Atualiza o cache e o estado
      set({
        monthlyBudgetsData: response.data,
        cache: {
          ...currentState.cache,
          [cacheKey]: {
            data: response.data,
            timestamp: now
          }
        },
        isLoading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao carregar dados de orçamentos',
        isLoading: false 
      });
    }
  },

  fetchEventsTraffic: async ({ venueId, year }) => {
    try {
      const currentState = get();
      const cacheKey = `events_traffic_${venueId}_${year}`;
      const cachedData = currentState.cache[cacheKey];
      const now = Date.now();

      // Se tiver cache válido, usa ele
      if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
        console.log("Using cached events traffic data");
        set({ trafficEventsData: cachedData.data });
        return;
      }

      console.log("Fetching fresh events traffic data");
      set({ isLoading: true, error: null });

      const response = await venueService.getVenueTrafficCount({ 
        venueId, 
        year, 
        approved: true 
      });

      // Atualiza o cache e o estado
      set({
        trafficEventsData: response.data,
        cache: {
          ...currentState.cache,
          [cacheKey]: {
            data: response.data,
            timestamp: now
          }
        },
        isLoading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao carregar tráfego de eventos',
        isLoading: false 
      });
    }
  },

  fetchBudgetsTraffic: async ({ venueId, year }) => {
    try {
      const currentState = get();
      const cacheKey = `budgets_traffic_${venueId}_${year}`;
      const cachedData = currentState.cache[cacheKey];
      const now = Date.now();

      // Se tiver cache válido, usa ele
      if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
        console.log("Using cached budgets traffic data");
        set({ trafficBudgetsData: cachedData.data });
        return;
      }

      console.log("Fetching fresh budgets traffic data");
      set({ isLoading: true, error: null });

      const response = await venueService.getVenueTrafficCount({ 
        venueId, 
        year, 
      });

      // Atualiza o cache e o estado
      set({
        trafficBudgetsData: response.data,
        cache: {
          ...currentState.cache,
          [cacheKey]: {
            data: response.data,
            timestamp: now
          }
        },
        isLoading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao carregar tráfego de orçamentos',
        isLoading: false 
      });
    }
  }
})); 