import { create } from 'zustand';
import {
    UserOrganizationPermission,
    CreateUserOrganizationPermissionDTO,
    UpdateUserOrganizationPermissionDTO,
    UserOrganizationPermissionListResponse,
    UserOrganizationPermissionCreateResponse,
    UserOrganizationPermissionUpdateResponse,
    UserOrganizationPermissionDeleteResponse
} from '@/types/userOrganizationPermission';
import { userOrganizationPermissionService } from '@/services/userOrganizationPermission.service';

interface UserOrganizationPermissionState {
    userOrganizationPermissions: UserOrganizationPermission[];
    currentUserOrganizationPermission: UserOrganizationPermission | null;
    isLoading: boolean;
    error: string | null;
    fetchUserOrganizationPermissions: (params?: { userOrganizationPermissionId?: string; organizationId?: string }) => Promise<void>;
    fetchCurrentUserOrganizationPermission: ({ organizattionId, userId }: { organizattionId: string, userId: string }) => Promise<void>;
    setCurrentUserOrganizationPermission: (userOrganizationPermission: UserOrganizationPermission | null) => void;
    createUserOrganizationPermission: (data: CreateUserOrganizationPermissionDTO) => Promise<void>;
    updateUserOrganizationPermission: (data: UpdateUserOrganizationPermissionDTO) => Promise<void>;
    deleteUserOrganizationPermission: (userOrganizationPermissionId: string) => Promise<void>;
}

export const useUserOrganizationPermissionStore = create<UserOrganizationPermissionState>((set, get) => ({
    userOrganizationPermissions: [],
    currentUserOrganizationPermission: null,
    isLoading: false,
    error: null,

    fetchUserOrganizationPermissions: async (params) => {
        try {
            set({ isLoading: true, error: null });
            const response = await userOrganizationPermissionService.getAllUserOrganizationPermissions(params);
            set({ userOrganizationPermissions: response.data.userOrganizationPermissionList, isLoading: false });
        } catch (err: unknown) {
            const error = err as Error;
            set({
                error: error?.message || "Não foi possível carregar as permissões dos usuários da organização.",
                isLoading: false
            });
            throw err;
        }
    },

    fetchCurrentUserOrganizationPermission: async ({ organizattionId, userId }: { organizattionId: string, userId: string }) => {
        try {
            set({ isLoading: true, error: null });
            const response = await userOrganizationPermissionService
            .getUserOrganizationPermissionById({ organizationId: organizattionId, userId: userId });
            set({ currentUserOrganizationPermission: response.data, isLoading: false });
        } catch (err: unknown) {
            const error = err as Error;
            set({
                error: error?.message || "Não foi possível carregar a permissão do usuário da organização.",
                isLoading: false
            });
            throw err;
        }
    },

    setCurrentUserOrganizationPermission: (userOrganizationPermission: UserOrganizationPermission | null) => {
        set({ currentUserOrganizationPermission: userOrganizationPermission });
    },

    createUserOrganizationPermission: async (data: CreateUserOrganizationPermissionDTO) => {
        try {
            set({ isLoading: true, error: null });
            await userOrganizationPermissionService.createUserOrganizationPermission(data);
            set({ isLoading: false });
        } catch (err: unknown) {
            const error = err as Error;
            set({
                error: error?.message || "Não foi possível criar a permissão do usuário da organização.",
                isLoading: false
            });
            throw err;
        }
    },

    updateUserOrganizationPermission: async (data: UpdateUserOrganizationPermissionDTO) => {
        try {
            set({ isLoading: true, error: null });
            await userOrganizationPermissionService.updateUserOrganizationPermission(data);
            set({ isLoading: false });
        } catch (err: unknown) {
            const error = err as Error;
            set({
                error: error?.message || "Não foi possível atualizar a permissão do usuário da organização.",
                isLoading: false
            });
            throw err;
        }
    },

    deleteUserOrganizationPermission: async (userOrganizationPermissionId: string) => {
        try {
            set({ isLoading: true, error: null });
            await userOrganizationPermissionService.deleteUserOrganizationPermission(userOrganizationPermissionId);
            set((state) => ({
                userOrganizationPermissions: state.userOrganizationPermissions.filter((perm) => perm.id !== userOrganizationPermissionId),
                isLoading: false
            }));
        } catch (err: unknown) {
            const error = err as Error;
            set({
                error: error?.message || "Não foi possível deletar a permissão do usuário da organização.",
                isLoading: false
            });
            throw err;
        }
    }
})); 