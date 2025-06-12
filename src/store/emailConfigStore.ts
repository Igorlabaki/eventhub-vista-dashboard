import { create } from 'zustand';
import {
  EmailConfig,
  EmailConfigListResponse,
  EmailConfigByIdResponse,
  EmailConfigCreateResponse,
  EmailConfigDeleteResponse,
  EmailConfigUpdateResponse,
  CreateEmailConfigDTO,
  UpdateEmailConfigDTO
} from '@/types/emailConfig';
import { emailConfigService } from '@/services/emailConfig.service';

interface EmailConfigStore {
  emailConfigs: EmailConfig[];
  currentEmailConfig: EmailConfig | null;
  isLoading: boolean;
  error: string | null;
  setEmailConfigs: (emailConfigs: EmailConfig[]) => void;
  setCurrentEmailConfig: (emailConfig: EmailConfig | null) => void;
  fetchEmailConfigs: (venueId: string, type?: string) => Promise<void>;
  fetchEmailConfigById: (emailConfigId: string) => Promise<void>;
  createEmailConfig: (data: CreateEmailConfigDTO) => Promise<EmailConfigCreateResponse>;
  updateEmailConfig: (data: UpdateEmailConfigDTO) => Promise<EmailConfigUpdateResponse>;
  deleteEmailConfig: (emailConfigId: string) => Promise<EmailConfigDeleteResponse>;
  addEmailConfig: (emailConfig: EmailConfig) => void;
  updateEmailConfigInStore: (emailConfig: EmailConfig) => void;
  removeEmailConfig: (emailConfigId: string) => void;
  clearError: () => void;
  fetchEmailConfigByType: (venueId: string, type: string) => Promise<void>;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useEmailConfigStore = create<EmailConfigStore>((set, get) => ({
  emailConfigs: [],
  currentEmailConfig: null,
  isLoading: false,
  error: null,

  setEmailConfigs: (emailConfigs) => set({ emailConfigs }),
  setCurrentEmailConfig: (emailConfig) => set({ currentEmailConfig: emailConfig }),

  fetchEmailConfigs: async (venueId: string, type?: 'PROPOSAL' | 'CONTRACT') => {
    set({ isLoading: true, error: null });
    try {
      const response = await emailConfigService.getEmailConfigsList(venueId, type);
      set({ emailConfigs: response.data });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Não foi possível carregar as configurações de email.",
        emailConfigs: []
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchEmailConfigById: async (emailConfigId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await emailConfigService.getEmailConfigById(emailConfigId);

      set({ currentEmailConfig: response.data });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Não foi possível carregar a configuração de email.",
        currentEmailConfig: null
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createEmailConfig: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await emailConfigService.createEmailConfig(data);
      set((state) => ({
        emailConfigs: [...state.emailConfigs, response.data],
        isLoading: false
      }));
      return response;
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Não foi possível criar a configuração de email.",
        isLoading: false
      });
      throw err;
    }
  },

  updateEmailConfig: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await emailConfigService.updateEmailConfig(data);
      set((state) => ({
        emailConfigs: state.emailConfigs.map((e) => e.id === data.emailConfigId ? response.data : e),
        currentEmailConfig: state.currentEmailConfig && state.currentEmailConfig.id === data.emailConfigId ? response.data : state.currentEmailConfig,
        isLoading: false
      }));
      return response;
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Não foi possível atualizar a configuração de email.",
        isLoading: false
      });
      throw err;
    }
  },

  deleteEmailConfig: async (emailConfigId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await emailConfigService.deleteEmailConfig(emailConfigId);
      set((state) => ({
        emailConfigs: state.emailConfigs.filter((e) => e.id !== emailConfigId),
        currentEmailConfig: state.currentEmailConfig && state.currentEmailConfig.id === emailConfigId ? null : state.currentEmailConfig,
        isLoading: false
      }));
      return response;
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Não foi possível excluir a configuração de email.",
        isLoading: false
      });
      throw err;
    }
  },

  addEmailConfig: (emailConfig) => set((state) => ({ emailConfigs: [...state.emailConfigs, emailConfig] })),

  updateEmailConfigInStore: (emailConfig) => set((state) => ({
    emailConfigs: state.emailConfigs.map((e) => e.id === emailConfig.id ? emailConfig : e),
    currentEmailConfig: state.currentEmailConfig && state.currentEmailConfig.id === emailConfig.id ? emailConfig : state.currentEmailConfig,
  })),

  removeEmailConfig: (emailConfigId) => set((state) => ({
    emailConfigs: state.emailConfigs.filter((e) => e.id !== emailConfigId),
    currentEmailConfig: state.currentEmailConfig && state.currentEmailConfig.id === emailConfigId ? null : state.currentEmailConfig,
  })),

  clearError: () => set({ error: null }),

  fetchEmailConfigByType: async (venueId: string, type: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await emailConfigService.getEmailConfigByType(venueId, type as string);
      set({ currentEmailConfig: response.data });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Não foi possível carregar a configuração de email por tipo.",
        currentEmailConfig: null
      });
    } finally {
      set({ isLoading: false });
    }
  },
})); 