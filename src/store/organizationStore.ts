import { create } from 'zustand';
import { Organization, OrganizationListResponse, OrganizationCreateResponse, OrganizationWithVenueCount } from '@/types/organization';
import { organizationService } from '@/services/organization.service';
import { BackendResponse } from '@/lib/error-handler';

interface OrganizationStore {
  organizations: OrganizationWithVenueCount[];
  currentOrganization: Organization | null;
  isLoading: boolean;
  error: string | null;
  setOrganizations: (orgs: OrganizationWithVenueCount[]) => void;
  setCurrentOrganization: (org: Organization | null) => void;
  fetchOrganizations: (userId: string) => Promise<void>;
  fetchOrganizationById: (organizationId: string) => Promise<void>;
  createOrganization: (data: { name: string; userId: string }) => Promise<BackendResponse<Organization>>;
  deleteOrganization: (id: string) => Promise<BackendResponse<void>>;
  updateOrganizationById: (id: string, data: { name: string }) => Promise<BackendResponse<Organization>>;
  addOrganization: (org: Organization) => void;
  updateOrganization: (org: Organization) => void;
  removeOrganization: (id: string) => void;
  clearError: () => void;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useOrganizationStore = create<OrganizationStore>((set, get) => ({
  organizations: [],
  currentOrganization: null,
  isLoading: false,
  error: null,
  setOrganizations: (orgs) => set({ organizations: orgs }),
  setCurrentOrganization: (org) => set({ currentOrganization: org }),
  fetchOrganizations: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await organizationService.getAllOrganizations(userId);
      set({ organizations: response.data.organizationList });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar as organizações.",
        organizations: [] 
      });
    } finally {
      set({ isLoading: false });
    }
  },
  fetchOrganizationById: async (organizationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await organizationService.getOrganizationById(organizationId);
   
      set({ currentOrganization: response.data });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar a organização.",
        currentOrganization: null 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createOrganization: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await organizationService.createOrganization(data);
      set((state) => ({ 
        organizations: [...state.organizations, response.data],
        isLoading: false 
      }));
      return response;
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível criar a organização.",
        isLoading: false 
      });
      throw err;
    }
  },

  deleteOrganization: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await organizationService.deleteOrganization(id);
      set((state) => ({
        organizations: state.organizations.filter((o) => o.id !== id),
        currentOrganization: state.currentOrganization && state.currentOrganization.id === id ? null : state.currentOrganization,
        isLoading: false
      }));
      return {
        success: true,
        message: "Organização excluída com sucesso",
        data: undefined
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível excluir a organização.",
        isLoading: false 
      });
      throw err;
    }
  },

  updateOrganizationById: async (id: string, data: { name: string }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await organizationService.updateOrganization(id, data);
      set((state) => ({
        organizations: state.organizations.map((o) => o.id === id ? response.data : o),
        currentOrganization: state.currentOrganization && state.currentOrganization.id === id ? response.data : state.currentOrganization,
        isLoading: false
      }));
      return {
        success: true,
        message: "Organização atualizada com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível atualizar a organização.",
        isLoading: false 
      });
      throw err;
    }
  },

  addOrganization: (org) => set((state) => ({ organizations: [...state.organizations, org] })),
  updateOrganization: (org) => set((state) => ({
    organizations: state.organizations.map((o) => o.id === org.id ? org : o),
    currentOrganization: state.currentOrganization && state.currentOrganization.id === org.id ? org : state.currentOrganization,
  })),
  removeOrganization: (id) => set((state) => ({
    organizations: state.organizations.filter((o) => o.id !== id),
    currentOrganization: state.currentOrganization && state.currentOrganization.id === id ? null : state.currentOrganization,
  })),
  clearError: () => set({ error: null }),
})); 