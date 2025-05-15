import { api } from '@/lib/axios';
import axios from 'axios';

interface LoginCredentials {
  email: string;
  password: string;
  fcmToken?: string;
}

interface GoogleLoginCredentials {
  googleToken: string;
  userData: {
    email: string;
    name: string;
    googleId: string;
    picture: string;
    password: string;
  };
}

interface AuthResponse {
  accessToken: string;
  session: {
    id: string;
    userId: string;
    refreshTokenId: string;
    expiresAt: string;
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/authenticate', credentials);
      localStorage.setItem("@EventHub:token", response.data.accessToken);
      localStorage.setItem(
        "@EventHub:session",
        JSON.stringify(response.data.session)
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Credenciais inválidas');
        }
        throw new Error(error.response?.data?.message || 'Erro ao fazer login');
      }
      throw error;
    }
  },

  async loginWithGoogle(credentials: GoogleLoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register/google', credentials);
      localStorage.setItem("@EventHub:token", response.data.accessToken);
      localStorage.setItem(
        "@EventHub:session",
        JSON.stringify(response.data.session)
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Erro ao fazer login com Google');
      }
      throw error;
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem('@EventHub:token');
    localStorage.removeItem('@EventHub:session');
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem('@EventHub:token');
    return !!token;
  },

  getToken(): string | null {
    return localStorage.getItem('@EventHub:token');
  },

  async register(data: { email: string; username: string; password: string; googleId?: string; avatarUrl?: string }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register", data);
    localStorage.setItem("@EventHub:token", response.data.accessToken);
    localStorage.setItem(
      "@EventHub:session",
      JSON.stringify(response.data.session)
    );
    return response.data;
  },

  async registerWithGoogle(credentials: GoogleLoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/register/google", credentials);
      localStorage.setItem("@EventHub:token", response.data.accessToken);
      localStorage.setItem(
        "@EventHub:session",
        JSON.stringify(response.data.session)
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Erro ao registrar com Google");
      }
      throw error;
    }
  },
}; 