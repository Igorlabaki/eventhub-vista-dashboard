import { create } from 'zustand';
import { 
  UserVenuePermission,
  CreateUserVenuePermissionDTO,
  UpdateUserVenuePermissionDTO,
  UserVenuePermissionListResponse,
  UserVenuePermissionCreateResponse,
  UserVenuePermissionUpdateResponse,
  UserVenuePermissionDeleteResponse,
  GetUserVenuePermissionDTO
} from '@/types/userVenuePermissions';
import { userVenuePermissionService } from '@/services/userVenuePermissions.service';
import { useUserOrganizationStore } from './userOrganizationStore';

interface UserVenuePermissionState {
  userVenuePermissions: UserVenuePermission[];
  currentUserVenuePermission: UserVenuePermission | null;
  isLoading: boolean;
  error: string | null;
  fetchUserVenuePermissions: (organizationId: string) => Promise<void>;
  fetchCurrentUserVenuePermission: (params: GetUserVenuePermissionDTO) => Promise<void>;
  setCurrentUserVenuePermission: (userVenuePermission: UserVenuePermission | null) => void;
  createUserVenuePermission: (data: CreateUserVenuePermissionDTO) => Promise<void>;
  updateUserVenuePermission: (data: UpdateUserVenuePermissionDTO, organizationId: string) => Promise<void>;
  deleteUserVenuePermission: (id: string, organizationId: string) => Promise<void>;
}

export const useUserVenuePermissionStore = create<UserVenuePermissionState>((set, get) => ({
  userVenuePermissions: [],
  currentUserVenuePermission: null,
  isLoading: false,
  error: null,

  fetchUserVenuePermissions: async (organizationId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await userVenuePermissionService.getAllUserVenuePermissions(organizationId);
      set({ userVenuePermissions: response.data.userVenuePermissionList, isLoading: false });
    } catch (err: unknown) {
      const error = err as Error;
      set({ 
        error: error?.message || "Não foi possível carregar as permissões dos usuários.",
        isLoading: false 
      });
      throw err;
    }
  },

  fetchCurrentUserVenuePermission: async (params: GetUserVenuePermissionDTO) => {
    try {
      set({ isLoading: true, error: null });
      const response = await userVenuePermissionService.getUserVenuePermission(params);
      set({ currentUserVenuePermission: response.data, isLoading: false });
      await useUserOrganizationStore.getState().fetchUserOrganizations(params.organizationId);
    } catch (err: unknown) {
      const error = err as Error;
      set({ 
        error: error?.message || "Não foi possível carregar a permissão do usuário.",
        isLoading: false 
      });
      throw err;
    }
  },

  setCurrentUserVenuePermission: (userVenuePermission: UserVenuePermission | null) => {
    set({ currentUserVenuePermission: userVenuePermission });
  },

  createUserVenuePermission: async (data: CreateUserVenuePermissionDTO) => {
    try {
      set({ isLoading: true, error: null });
      await userVenuePermissionService.createUserVenuePermission(data);
      await useUserOrganizationStore.getState().fetchUserOrganizations(data.userOrganizationId);
      set({ isLoading: false });
    } catch (err: unknown) {
      const error = err as Error;
      set({ 
        error: error?.message || "Não foi possível criar a permissão do usuário.",
        isLoading: false 
      });
      throw err;
    }
  },

  updateUserVenuePermission: async (data: UpdateUserVenuePermissionDTO, organizationId: string) => {
    try {
      set({ isLoading: true, error: null });
      await userVenuePermissionService.updateUserVenuePermission(data);
      await useUserOrganizationStore.getState().fetchUserOrganizations(organizationId);
      set({ isLoading: false });
    } catch (err: unknown) {
      const error = err as Error;
      set({ 
        error: error?.message || "Não foi possível atualizar a permissão do usuário.",
        isLoading: false 
      });
      throw err;
    }
  },

  deleteUserVenuePermission: async (id: string, organizationId: string) => {
    try {
      set({ isLoading: true, error: null });
      await userVenuePermissionService.deleteUserVenuePermission(id);
      await useUserOrganizationStore.getState().fetchUserOrganizations(organizationId);
      set({ isLoading: false });
    } catch (err: unknown) {
      const error = err as Error;
      set({ 
        error: error?.message || "Não foi possível deletar a permissão do usuário.",
        isLoading: false 
      });
      throw err;
    }
  }
})); 