import { create } from 'zustand';
import { 
  UserOrganization, 
  UserOrganizationListResponse,
  CreateUserOrganizationDTO,
  UpdateUserOrganizationDTO
} from '@/types/userOrganization';
import { userOrganizationService } from '@/services/user-organization.service';
import { User } from '@/components/ui/user-list';
import { userService } from '@/services/user.service';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
}

type ApiError = AxiosError<ErrorResponse>;

interface UserOrganizationState {
  userOrganizations: UserOrganization[];
  isLoading: boolean;
  error: string | null;
  searchedUser: User | null;
  fetchUserOrganizations: (organizationId: string) => Promise<void>;
  createUserOrganization: (data: CreateUserOrganizationDTO) => Promise<void>;
  updateUserOrganization: (userOrganizationId: string, data: Partial<UpdateUserOrganizationDTO>) => Promise<void>;
  deleteUserOrganization: (id: string) => Promise<void>;
}

export const useUserOrganizationStore = create<UserOrganizationState>((set) => ({
  userOrganizations: [],
  isLoading: false,
  error: null,
  searchedUser: null,

  fetchUserOrganizations: async (organizationId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await userOrganizationService.getAllUserOrganizations(organizationId);
      set({ userOrganizations: response.data.userOrganizationByOrganizationList, isLoading: false });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar os usuários da organização.",
        isLoading: false 
      });
      throw err;
    }
  },

  createUserOrganization: async (data: CreateUserOrganizationDTO) => {
    try {
      set({ isLoading: true, error: null });
      await userOrganizationService.createUserOrganization(data);
      set((state) => ({
        isLoading: false,
      }));
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível criar o usuário na organização.",
        isLoading: false 
      });
      throw err;
    }
  },

  updateUserOrganization: async (userOrganizationId: string, data: Partial<UpdateUserOrganizationDTO>) => {
    try {
      set({ isLoading: true, error: null });
      await userOrganizationService.updateUserOrganization(userOrganizationId, data);
      set((state) => ({
        isLoading: false,
      }));
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível atualizar o usuário da organização.",
        isLoading: false 
      });
      throw err;
    }
  },

  deleteUserOrganization: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await userOrganizationService.deleteUserOrganization(id);
      set((state) => ({
        userOrganizations: state.userOrganizations.filter((org) => org.id !== id),
        isLoading: false,
      }));
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível deletar o usuário da organização.",
        isLoading: false 
      });
      throw err;
    }
  },
})); 