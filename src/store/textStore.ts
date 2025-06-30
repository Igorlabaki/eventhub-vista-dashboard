import { create } from 'zustand';
import { 
  Text, 
  CreateTextDTO, 
  UpdateTextDTO,
  ListTextParams,
  CreateTextOrganizationDTO,
  UpdateTextOrganizationDTO,
  ListTextOrganizationParams
} from '@/types/text';
import { textService } from '@/services/text.service';
import { BackendResponse } from '@/lib/error-handler';

interface TextStore {
  texts: Text[];
  textOrganizationList: Text[];
  currentText: Text | null;
  isLoading: boolean;
  error: string | null;
  setTexts: (texts: Text[]) => void;
  setTextOrganizationList: (texts: Text[]) => void;
  setCurrentText: (text: Text | null) => void;
  fetchTexts: (params: ListTextParams) => Promise<void>;
  fetchTextsOrganization: (params: ListTextOrganizationParams) => Promise<void>;
  createText: (data: CreateTextDTO) => Promise<BackendResponse<Text>>;
  createTextOrganization: (data: CreateTextOrganizationDTO) => Promise<BackendResponse<Text>>;
  updateText: (data: UpdateTextDTO) => Promise<BackendResponse<Text>>;
  updateTextOrganization: (data: UpdateTextOrganizationDTO) => Promise<BackendResponse<Text>>;
  deleteText: (id: string) => Promise<BackendResponse<void>>;
  addText: (text: Text) => void;
  addTextOrganization: (text: Text) => void;
  updateTextInStore: (text: Text) => void;
  updateTextOrganizationInStore: (text: Text) => void;
  removeText: (id: string) => void;
  removeTextOrganization: (id: string) => void;
  clearError: () => void;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useTextStore = create<TextStore>((set, get) => ({
  texts: [],
  textOrganizationList: [],
  currentText: null,
  isLoading: false,
  error: null,
  setTexts: (texts) => set({ texts }),
  setTextOrganizationList: (texts) => set({ textOrganizationList: texts }),
  setCurrentText: (text) => set({ currentText: text }),
  
  fetchTexts: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await textService.listTexts(params);
      set({ texts: response.data.textList });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar os textos.",
        texts: [] 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTextsOrganization: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await textService.listTextOrganization(params);
      set({ textOrganizationList: response.data.textList });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar os textos da organização.",
        textOrganizationList: [] 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createText: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await textService.createText(data);
      set((state) => ({ 
        texts: [...state.texts, response.data],
        isLoading: false 
      }));
      return {
        success: true,
        message: "Texto criado com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível criar o texto.",
        isLoading: false 
      });
      throw err;
    }
  },

  createTextOrganization: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await textService.createTextOrganization(data);
      set((state) => ({ 
        textOrganizationList: [...state.textOrganizationList, response.data],
        isLoading: false 
      }));
      return {
        success: true,
        message: "Texto da organização criado com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível criar o texto da organização.",
        isLoading: false 
      });
      throw err;
    }
  },

  updateText: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await textService.updateText(data);
      set((state) => ({
        texts: state.texts.map((t) => t.id === response.data.id ? response.data : t),
        currentText: state.currentText && state.currentText.id === response.data.id ? response.data : state.currentText,
        isLoading: false
      }));
      return {
        success: true,
        message: "Texto atualizado com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível atualizar o texto.",
        isLoading: false 
      });
      throw err;
    }
  },

  updateTextOrganization: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await textService.updateTextOrganization(data);
      set((state) => ({
        textOrganizationList: state.textOrganizationList.map((t) => t.id === response.data.id ? response.data : t),
        currentText: state.currentText && state.currentText.id === response.data.id ? response.data : state.currentText,
        isLoading: false
      }));
      return {
        success: true,
        message: "Texto da organização atualizado com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível atualizar o texto da organização.",
        isLoading: false 
      });
      throw err;
    }
  },

  deleteText: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await textService.deleteText(id);
      set((state) => ({
        texts: state.texts.filter((t) => t.id !== id),
        textOrganizationList: state.textOrganizationList.filter((t) => t.id !== id),
        currentText: state.currentText && state.currentText.id === id ? null : state.currentText,
        isLoading: false
      }));
      return {
        success: true,
        message: "Texto excluído com sucesso",
        data: undefined
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível excluir o texto.",
        isLoading: false 
      });
      throw err;
    }
  },

  addText: (text) => set((state) => ({ texts: [...state.texts, text] })),
  
  updateTextInStore: (text) => set((state) => ({
    texts: state.texts.map((t) => t.id === text.id ? text : t),
    currentText: state.currentText && state.currentText.id === text.id ? text : state.currentText,
  })),
  
  removeText: (id) => set((state) => ({
    texts: state.texts.filter((t) => t.id !== id),
    currentText: state.currentText && state.currentText.id === id ? null : state.currentText,
  })),
  
  addTextOrganization: (text) => set((state) => ({ 
    textOrganizationList: [...state.textOrganizationList, text] 
  })),
  
  updateTextOrganizationInStore: (text) => set((state) => ({
    textOrganizationList: state.textOrganizationList.map((t) => t.id === text.id ? text : t),
    currentText: state.currentText && state.currentText.id === text.id ? text : state.currentText,
  })),
  
  removeTextOrganization: (id) => set((state) => ({
    textOrganizationList: state.textOrganizationList.filter((t) => t.id !== id),
    currentText: state.currentText && state.currentText.id === id ? null : state.currentText,
  })),
  
  clearError: () => set({ error: null }),
})); 