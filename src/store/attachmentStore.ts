import { create } from 'zustand';
import { Attachment, AttachmentListResponse, AttachmentCreateResponse, AttachmentDeleteResponse, AttachmentUpdateResponse, CreateAttachmentDTO, UpdateAttachmentDTO } from '@/types/attachment';
import { attachmentService } from '@/services/attachments.service';
import { BackendResponse } from '@/lib/error-handler';

interface AttachmentStore {
  attachments: Attachment[];
  currentAttachment: Attachment | null;
  isLoading: boolean;
  error: string | null;
  setAttachments: (attachments: Attachment[]) => void;
  setCurrentAttachment: (attachment: Attachment | null) => void;
  fetchAttachments: (organizationId: string) => Promise<void>;
  fetchAttachmentById: (attachmentId: string) => Promise<void>;
  createAttachment: (data: CreateAttachmentDTO) => Promise<BackendResponse<Attachment>>;
  deleteAttachment: (id: string) => Promise<BackendResponse<void>>;
  updateAttachment: (data: UpdateAttachmentDTO) => Promise<BackendResponse<Attachment>>;
  addAttachment: (attachment: Attachment) => void;
  updateAttachmentInStore: (attachment: Attachment) => void;
  removeAttachment: (id: string) => void;
  clearError: () => void;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useAttachmentStore = create<AttachmentStore>((set, get) => ({
  attachments: [],
  currentAttachment: null,
  isLoading: false,
  error: null,
  setAttachments: (attachments) => set({ attachments }),
  setCurrentAttachment: (attachment) => set({ currentAttachment: attachment }),
  fetchAttachments: async (organizationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await attachmentService.getAttachmentsList(organizationId);
      set({ attachments: response.data.attachmentList });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar os anexos.",
        attachments: [] 
      });
    } finally {
      set({ isLoading: false });
    }
  },
  fetchAttachmentById: async (attachmentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await attachmentService.getAttachmentById(attachmentId);
      set({ currentAttachment: response.data.attachment });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar o anexo.",
        currentAttachment: null 
      });
    } finally {
      set({ isLoading: false });
    }
  },
  createAttachment: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await attachmentService.createAttachment(data);
      set((state) => ({ 
        attachments: [...state.attachments, response.data],
        isLoading: false 
      }));
      return {
        success: true,
        message: "Anexo criado com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível criar o anexo.",
        isLoading: false 
      });
      throw err;
    }
  },
  deleteAttachment: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await attachmentService.deleteAttachment(id);
      set((state) => ({
        attachments: state.attachments.filter((a) => a.id !== id),
        currentAttachment: state.currentAttachment && state.currentAttachment.id === id ? null : state.currentAttachment,
        isLoading: false
      }));
      return {
        success: true,
        message: "Anexo excluído com sucesso",
        data: undefined
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível excluir o anexo.",
        isLoading: false 
      });
      throw err;
    }
  },
  updateAttachment: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await attachmentService.updateAttachment(data);
      set((state) => ({
        attachments: state.attachments.map((a) => a.id === data.attachmentId ? response.data : a),
        currentAttachment: state.currentAttachment && state.currentAttachment.id === data.attachmentId ? response.data : state.currentAttachment,
        isLoading: false
      }));
      return {
        success: true,
        message: "Anexo atualizado com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível atualizar o anexo.",
        isLoading: false 
      });
      throw err;
    }
  },
  addAttachment: (attachment) => set((state) => ({ attachments: [...state.attachments, attachment] })),
  updateAttachmentInStore: (attachment) => set((state) => ({
    attachments: state.attachments.map((a) => a.id === attachment.id ? attachment : a),
    currentAttachment: state.currentAttachment && state.currentAttachment.id === attachment.id ? attachment : state.currentAttachment,
  })),
  removeAttachment: (id) => set((state) => ({
    attachments: state.attachments.filter((a) => a.id !== id),
    currentAttachment: state.currentAttachment && state.currentAttachment.id === id ? null : state.currentAttachment,
  })),
  clearError: () => set({ error: null }),
})); 