import { create } from 'zustand';
import { Venue, ItemListVenueResponse, VenueListResponse, CreateVenueDTO, VenueCreateResponse, VenueDeleteResponse, UpdateVenueDTO } from '@/types/venue';
import { venueService } from '@/services/venue.service';
import { AxiosError } from 'axios';
import { BackendResponse } from '@/lib/error-handler';

interface ErrorResponse {
  message: string;
}

type ApiError = AxiosError<ErrorResponse>;

interface VenueState {
  venues: ItemListVenueResponse[];
  isLoading: boolean;
  error: string | null;
  selectedVenue: Venue | null;
  fetchVenues: (params: { organizationId: string, userId: string }) => Promise<void>;
  fetchVenueById: ( venueId: string, userId?: string ) => Promise<void>;
  createVenue: (data: CreateVenueDTO) => Promise<BackendResponse<Venue>>;
  updateVenue: (data: UpdateVenueDTO) => Promise<BackendResponse<Venue>>;
  deleteVenue: (id: string) => Promise<BackendResponse<void>>;
  clearSelectedVenue: () => void;
}

export const useVenueStore = create<VenueState>((set) => ({
  venues: [],
  isLoading: false,
  error: null,
  selectedVenue: null,

  fetchVenues: async ({ organizationId, userId }: { organizationId: string, userId: string }) => {
    try {
      set({ isLoading: true, error: null });
      const response = await venueService.getAllVenues({ organizationId, userId });
      set({ venues: response.data.venueList, isLoading: false });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar os espaços.",
        isLoading: false 
      });
      throw err;
    }
  },

  fetchVenueById: async (venueId: string, userId?: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await venueService.getVenueById({ venueId, userId });
      set({ selectedVenue: response.data, isLoading: false });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar o espaço.",
        isLoading: false 
      });
      throw err;
    }
  },

  createVenue: async (data: CreateVenueDTO) => {
    try {
      set({ isLoading: true, error: null });
      const response = await venueService.createVenue(data);
      const venuesResponse = await venueService.getAllVenues({organizationId:data.organizationId, userId:data.userId});
      set({ venues: venuesResponse.data.venueList, isLoading: false });
      return {
        success: true,
        message: "Espaço criado com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível criar o espaço.",
        isLoading: false 
      });
      throw err;
    }
  },

  updateVenue: async (data: UpdateVenueDTO) => {
    try {
      set({ isLoading: true, error: null });
      const response = await venueService.updateVenue(data);
      set((state) => ({
        isLoading: false,
        venues: state.venues.map(v =>
          v.id === response.data.id ? { ...v, ...response.data } : v
        )
      }));
      return response;
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível atualizar o espaço.",
        isLoading: false 
      });
      throw err;
    }
  },

  

  deleteVenue: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await venueService.deleteVenue(id);
      set((state) => ({
        venues: state.venues.filter(venue => venue.id !== id),
        isLoading: false
      }));
      return {
        success: true,
        message: "Espaço excluído com sucesso",
        data: undefined
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível excluir o espaço.",
        isLoading: false 
      });
      throw err;
    }
  },

  clearSelectedVenue: () => set({ selectedVenue: null }),
})); 