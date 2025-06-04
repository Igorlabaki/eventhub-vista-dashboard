import { create } from 'zustand';
import { DateEvent, CreateDateEventDTO } from '@/types/dateEvent';
import { dateEventService } from '@/services/dateEvent.service';
import { BackendResponse } from '@/lib/error-handler';

interface DateEventStore {
  dateEvents: DateEvent[];
  currentDateEvent: DateEvent | null;
  isLoading: boolean;
  error: string | null;
  setDateEvents: (events: DateEvent[]) => void;
  setCurrentDateEvent: (event: DateEvent | null) => void;
  fetchDateEvents: (venueId?: string, proposalId?: string) => Promise<void>;
  createSameDayEvent: (data: CreateDateEventDTO) => Promise<BackendResponse<DateEvent>>;
  createOvernightEvent: (data: CreateDateEventDTO) => Promise<BackendResponse<DateEvent>>;
  updateSameDayEvent: (data: CreateDateEventDTO) => Promise<BackendResponse<DateEvent>>;
  updateOvernightEvent: (data: CreateDateEventDTO) => Promise<BackendResponse<DateEvent>>;
  deleteDateEvent: (id: string) => Promise<BackendResponse<void>>;
  addDateEvent: (event: DateEvent) => void;
  updateDateEvent: (event: DateEvent) => void;
  removeDateEvent: (id: string) => void;
  clearError: () => void;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useDateEventStore = create<DateEventStore>((set, get) => ({
  dateEvents: [],
  currentDateEvent: null,
  isLoading: false,
  error: null,
  setDateEvents: (events) => set({ dateEvents: events }),
  setCurrentDateEvent: (event) => set({ currentDateEvent: event }),
  
  fetchDateEvents: async (venueId?: string, proposalId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await dateEventService.getAllDateEvents(venueId, proposalId);
      set({ dateEvents: response.data.dateEventList });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar os eventos.",
        dateEvents: [] 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createSameDayEvent: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await dateEventService.createSameDayEvent(data);
      set((state) => ({ 
        dateEvents: [...state.dateEvents, response.data],
        isLoading: false 
      }));
      return response;
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível criar o evento.",
        isLoading: false 
      });
      throw err;
    }
  },

  createOvernightEvent: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await dateEventService.createOvernightEvent(data);
      set((state) => ({ 
        dateEvents: [...state.dateEvents, response.data],
        isLoading: false 
      }));
      return response;
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível criar o evento.",
        isLoading: false 
      });
      throw err;
    }
  },

  updateSameDayEvent: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await dateEventService.updateSameDayEvent(data);
      set((state) => ({
        dateEvents: state.dateEvents.map((e) => e.id === response.data.id ? response.data : e),
        currentDateEvent: state.currentDateEvent && state.currentDateEvent.id === response.data.id ? response.data : state.currentDateEvent,
        isLoading: false
      }));
      return response;
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível atualizar o evento.",
        isLoading: false 
      });
      throw err;
    }
  },

  updateOvernightEvent: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await dateEventService.updateOvernightEvent(data);
      set((state) => ({
        dateEvents: state.dateEvents.map((e) => e.id === response.data.id ? response.data : e),
        currentDateEvent: state.currentDateEvent && state.currentDateEvent.id === response.data.id ? response.data : state.currentDateEvent,
        isLoading: false
      }));
      return response;
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível atualizar o evento.",
        isLoading: false 
      });
      throw err;
    }
  },

  deleteDateEvent: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await dateEventService.deleteDateEvent(id);
      set((state) => ({
        dateEvents: state.dateEvents.filter((e) => e.id !== id),
        currentDateEvent: state.currentDateEvent && state.currentDateEvent.id === id ? null : state.currentDateEvent,
        isLoading: false
      }));
      return {
        success: true,
        message: "Evento excluído com sucesso",
        data: undefined
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível excluir o evento.",
        isLoading: false 
      });
      throw err;
    }
  },

  addDateEvent: (event) => set((state) => ({ dateEvents: [...state.dateEvents, event] })),
  
  updateDateEvent: (event) => set((state) => ({
    dateEvents: state.dateEvents.map((e) => e.id === event.id ? event : e),
    currentDateEvent: state.currentDateEvent && state.currentDateEvent.id === event.id ? event : state.currentDateEvent,
  })),
  
  removeDateEvent: (id) => set((state) => ({
    dateEvents: state.dateEvents.filter((e) => e.id !== id),
    currentDateEvent: state.currentDateEvent && state.currentDateEvent.id === id ? null : state.currentDateEvent,
  })),
  
  clearError: () => set({ error: null }),
})); 