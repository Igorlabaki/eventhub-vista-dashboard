import { create } from 'zustand';
import { 
  UserPermission,
  CreateUserPermissionDTO,
  UpdateUserPermissionDTO,
  UserPermissionListResponse,
  UserPermissionCreateResponse,
  UserPermissionUpdateResponse,
  UserPermissionDeleteResponse
} from '@/types/userPermissions';
import { userPermissionService } from '@/services/userpermissions.service';
import { useUserOrganizationStore } from './userOrganizationStore';

interface UserPermissionState {
  userPermissions: UserPermission[];
  isLoading: boolean;
  error: string | null;
  fetchUserPermissions: (organizationId: string) => Promise<void>;
  createUserPermission: (data: CreateUserPermissionDTO) => Promise<void>;
  updateUserPermission: (data: UpdateUserPermissionDTO, organizationId: string) => Promise<void>;
  deleteUserPermission: (id: string, organizationId: string) => Promise<void>;
}

export const useUserPermissionStore = create<UserPermissionState>((set, get) => ({
  userPermissions: [],
  isLoading: false,
  error: null,

  fetchUserPermissions: async (organizationId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await userPermissionService.getAllUserPermissions(organizationId);
      set({ userPermissions: response.data.userPermissionList, isLoading: false });
    } catch (err: unknown) {
      const error = err as Error;
      set({ 
        error: error?.message || "Não foi possível carregar as permissões dos usuários.",
        isLoading: false 
      });
      throw err;
    }
  },

  createUserPermission: async (data: CreateUserPermissionDTO) => {
    try {
      set({ isLoading: true, error: null });
      await userPermissionService.createUserPermission(data);
      // Atualiza a lista de userOrganization após criar a permissão
      await useUserOrganizationStore.getState().fetchUserOrganizations(data.organizationId);
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

  updateUserPermission: async (data: UpdateUserPermissionDTO, organizationId: string) => {
    try {
      set({ isLoading: true, error: null });
      await userPermissionService.updateUserPermission(data);
      // Atualiza a lista de userOrganization após atualizar a permissão
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

  deleteUserPermission: async (id: string, organizationId: string) => {
    try {
      set({ isLoading: true, error: null });
      await userPermissionService.deleteUserPermission(id);
      // Atualiza a lista de userOrganization após deletar a permissão
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