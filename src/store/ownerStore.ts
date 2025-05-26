import { create } from 'zustand';
import { 
  Owner, 
  OwnerListResponse, 
  OwnerByIdResponse, 
  OwnerCreateResponse, 
  OwnerDeleteResponse, 
  OwnerUpdateResponse,
  CreateOrganizationOwnerRequestParams,
  CreateVenueOwnerRequestParams,
  ListOwnerByVenueIdQuerySchema,
  UpdateOwnerDTO
} from '@/types/owner';
import { ownerService } from '@/services/owner.service';
import { BackendResponse } from '@/lib/error-handler';

interface OwnerStore {
  owners: Owner[];
  currentOwner: Owner | null;
  isLoading: boolean;
  error: string | null;
  setOwners: (owners: Owner[]) => void;
  setCurrentOwner: (owner: Owner | null) => void;
  fetchOrganizationOwners: (organizationId: string) => Promise<void>;
  fetchOwnersByVenueId: (params: ListOwnerByVenueIdQuerySchema) => Promise<void>;
  fetchOwnerById: (ownerId: string) => Promise<void>;
  createOrganizationOwner: (data: CreateOrganizationOwnerRequestParams) => Promise<BackendResponse<Owner>>;
  createVenueOwner: (data: CreateVenueOwnerRequestParams) => Promise<BackendResponse<Owner>>;
  updateOwner: (ownerId: string, data: UpdateOwnerDTO) => Promise<BackendResponse<Owner>>;
  deleteOwner: (id: string) => Promise<BackendResponse<void>>;
  addOwner: (owner: Owner) => void;
  updateOwnerInStore: (owner: Owner) => void;
  removeOwner: (id: string) => void;
  clearError: () => void;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useOwnerStore = create<OwnerStore>((set, get) => ({
  owners: [],
  currentOwner: null,
  isLoading: false,
  error: null,

  setOwners: (owners) => set({ owners }),
  setCurrentOwner: (owner) => set({ currentOwner: owner }),

  fetchOrganizationOwners: async (organizationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ownerService.getAllOrganizationOwners(organizationId);
      set({ owners: response.data.ownerByOrganizationList });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar os proprietários.",
        owners: [] 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchOwnersByVenueId: async (params: ListOwnerByVenueIdQuerySchema) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ownerService.getOwnersByVenueId(params);
      set({ owners: response.data.ownerByOrganizationList });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar os proprietários do espaço.",
        owners: [] 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchOwnerById: async (ownerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ownerService.getOwnerById(ownerId);
      set({ currentOwner: response.data.owner });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar o proprietário.",
        currentOwner: null 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createOrganizationOwner: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ownerService.createOrganizationOwner(data);
      set((state) => ({ 
        owners: [...state.owners, response.data],
        isLoading: false 
      }));
      return {
        success: true,
        message: "Proprietário criado com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível criar o proprietário.",
        isLoading: false 
      });
      throw err;
    }
  },

  createVenueOwner: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ownerService.createVenueOwner(data);
      set((state) => ({ 
        owners: [...state.owners, response.data],
        isLoading: false 
      }));
      return {
        success: true,
        message: "Proprietário do espaço criado com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível criar o proprietário do espaço.",
        isLoading: false 
      });
      throw err;
    }
  },

  updateOwner: async (ownerId, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ownerService.updateOwner(ownerId, data);
      set((state) => ({
        owners: state.owners.map((o) => {
          if (o.id === ownerId) {
            return {
              ...o,
              ...response.data,
            };
          }
          return o;
        }),
        currentOwner: state.currentOwner && state.currentOwner.id === ownerId
          ? {
              ...state.currentOwner,
              ...response.data,
            }
          : state.currentOwner,
        isLoading: false
      }));
      return {
        success: true,
        message: "Proprietário atualizado com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível atualizar o proprietário.",
        isLoading: false 
      });
      throw err;
    }
  },

  deleteOwner: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ownerService.deleteOwner(id);
      set((state) => ({
        owners: state.owners.filter((o) => o.id !== id),
        currentOwner: state.currentOwner && state.currentOwner.id === id ? null : state.currentOwner,
        isLoading: false
      }));
      return {
        success: true,
        message: "Proprietário excluído com sucesso",
        data: undefined
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível excluir o proprietário.",
        isLoading: false 
      });
      throw err;
    }
  },

  addOwner: (owner) => set((state) => ({ owners: [...state.owners, owner] })),
  
  updateOwnerInStore: (owner) => set((state) => ({
    owners: state.owners.map((o) => o.id === owner.id ? owner : o),
    currentOwner: state.currentOwner && state.currentOwner.id === owner.id ? owner : state.currentOwner,
  })),
  
  removeOwner: (id) => set((state) => ({
    owners: state.owners.filter((o) => o.id !== id),
    currentOwner: state.currentOwner && state.currentOwner.id === id ? null : state.currentOwner,
  })),
  
  clearError: () => set({ error: null }),
})); 