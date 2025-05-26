import { create } from 'zustand';
import { userService } from '@/services/user.service';
import { UpdateUserResponse } from '@/types';
import { AxiosError } from 'axios';

interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  googleId?: string;
  fcmToken?: string;
}

interface UpdateUserData {
  userId: string;
  name?: string;
  email?: string;
  username?: string;
  avatarUrl?: string;
}

interface UpdateAvatarData {
  userId: string;
  file: File;
}

interface UpdatePasswordData {
  userId: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ErrorResponse {
  message: string;
}

type ApiError = AxiosError<ErrorResponse>;

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  updateUser: (data: UpdateUserData) => Promise<UpdateUserResponse>;
  updateAvatar: (data: UpdateAvatarData) => Promise<UpdateUserResponse>;
  updatePassword: (data: UpdatePasswordData) => Promise<UpdateUserResponse>;
  searchedUser: User | null;
  isLoading: boolean;
  error: string | null;
  searchUserByEmail: (email: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isAuthenticated: false,
  setIsAuthenticated: (auth) => set({ isAuthenticated: auth }),
  updateUser: async (data) => {
    const response = await userService.updateUser(data);
    set((state) => {
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          ...response.data,
        },
      };
    });
    return response;
  },
  updateAvatar: async (data) => {
    const response = await userService.updateAvatar(data.userId, data.file);
    set((state) => {
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          avatarUrl: response.data.avatarUrl,
        },
      };
    });
    return response;
  },
  updatePassword: async (data) => {
    const response = await userService.updatePassword(data);
    return response;
  },
  searchedUser: null,
  isLoading: false,
  error: null,
  searchUserByEmail: async (email: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await userService.getByEmail(email);
      set({ searchedUser: response.data, isLoading: false });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Não foi possível buscar o usuário por email.",
        isLoading: false
      });
      throw err;
    }
  },
})); 