import { create } from 'zustand';
import { 
  Document, 
  CreateDocumentDTO,
  UpdateDocumentDTO,
  ListDocumentParams
} from '@/types/document';
import { documentService } from '@/services/document.service';
import { BackendResponse } from '@/lib/error-handler';

interface DocumentStore {
  documents: Document[];
  currentDocument: Document | null;
  isLoading: boolean;
  error: string | null;
  setDocuments: (documents: Document[]) => void;
  setCurrentDocument: (document: Document | null) => void;
  fetchDocuments: (params: ListDocumentParams) => Promise<void>;
  fetchDocumentById: (documentId: string) => Promise<void>;
  createDocument: (data: CreateDocumentDTO) => Promise<BackendResponse<Document>>;
  updateDocument: (data: UpdateDocumentDTO) => Promise<BackendResponse<Document>>;
  deleteDocument: (id: string) => Promise<BackendResponse<void>>;
  addDocument: (document: Document) => void;
  updateDocumentInStore: (document: Document) => void;
  removeDocument: (id: string) => void;
  clearError: () => void;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
  currentDocument: null,
  isLoading: false,
  error: null,
  setDocuments: (documents) => set({ documents }),
  setCurrentDocument: (document) => set({ currentDocument: document }),
  
  fetchDocuments: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await documentService.listDocuments(params);
      set({ documents: response.data.documentList });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar os documentos.",
        documents: [] 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDocumentById: async (documentId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await documentService.getDocumentById(documentId);
      set({ currentDocument: response.data });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar o documento.",
        currentDocument: null 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createDocument: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await documentService.createDocument(data);
      set((state) => ({ 
        documents: [...state.documents, response.data],
        isLoading: false 
      }));
      return {
        success: true,
        message: "Documento criado com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível criar o documento.",
        isLoading: false 
      });
      throw err;
    }
  },

  updateDocument: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await documentService.updateDocument(data);
      set((state) => ({
        documents: state.documents.map((d) => d.id === response.data.id ? response.data : d),
        currentDocument: state.currentDocument && state.currentDocument.id === response.data.id ? response.data : state.currentDocument,
        isLoading: false
      }));
      return {
        success: true,
        message: "Documento atualizado com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível atualizar o documento.",
        isLoading: false 
      });
      throw err;
    }
  },

  deleteDocument: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await documentService.deleteDocument(id);
      set((state) => ({
        documents: state.documents.filter((d) => d.id !== id),
        currentDocument: state.currentDocument && state.currentDocument.id === id ? null : state.currentDocument,
        isLoading: false
      }));
      return {
        success: true,
        message: "Documento excluído com sucesso",
        data: undefined
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível excluir o documento.",
        isLoading: false 
      });
      throw err;
    }
  },

  addDocument: (document) => set((state) => ({ documents: [...state.documents, document] })),
  
  updateDocumentInStore: (document) => set((state) => ({
    documents: state.documents.map((d) => d.id === document.id ? document : d),
    currentDocument: state.currentDocument && state.currentDocument.id === document.id ? document : state.currentDocument,
  })),
  
  removeDocument: (id) => set((state) => ({
    documents: state.documents.filter((d) => d.id !== id),
    currentDocument: state.currentDocument && state.currentDocument.id === id ? null : state.currentDocument,
  })),
  
  clearError: () => set({ error: null }),
})); 