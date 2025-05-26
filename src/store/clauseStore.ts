import { create } from 'zustand';
import { 
  Clause, 
  ClauseListResponse, 
  ClauseByIdResponse, 
  ClauseCreateResponse, 
  ClauseDeleteResponse, 
  ClauseUpdateResponse,
  CreateClauseDTO,
  UpdateClauseDTO
} from '@/types/clause';
import { clauseService } from '@/services/clause.service';
import { BackendResponse } from '@/lib/error-handler';

interface ClauseStore {
  clauses: Clause[];
  currentClause: Clause | null;
  isLoading: boolean;
  error: string | null;
  setClauses: (clauses: Clause[]) => void;
  setCurrentClause: (clause: Clause | null) => void;
  fetchClauses: (organizationId: string) => Promise<void>;
  fetchClauseById: (clauseId: string) => Promise<void>;
  createClause: (data: CreateClauseDTO) => Promise<BackendResponse<Clause>>;
  updateClause: (data: UpdateClauseDTO) => Promise<BackendResponse<Clause>>;
  deleteClause: (id: string) => Promise<BackendResponse<void>>;
  addClause: (clause: Clause) => void;
  updateClauseInStore: (clause: Clause) => void;
  removeClause: (id: string) => void;
  clearError: () => void;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useClauseStore = create<ClauseStore>((set, get) => ({
  clauses: [],
  currentClause: null,
  isLoading: false,
  error: null,

  setClauses: (clauses) => set({ clauses }),
  setCurrentClause: (clause) => set({ currentClause: clause }),

  fetchClauses: async (organizationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await clauseService.getClausesList(organizationId);
      set({ clauses: response.data.clauseList });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar as cláusulas.",
        clauses: [] 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchClauseById: async (clauseId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await clauseService.getClauseById(clauseId);
      set({ currentClause: response.data.clause });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar a cláusula.",
        currentClause: null 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createClause: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await clauseService.createClause(data);
      set((state) => ({ 
        clauses: [...state.clauses, response.data],
        isLoading: false 
      }));
      return {
        success: true,
        message: "Cláusula criada com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível criar a cláusula.",
        isLoading: false 
      });
      throw err;
    }
  },

  updateClause: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await clauseService.updateClause(data);
      set((state) => ({
        clauses: state.clauses.map((c) => c.id === data.clauseId ? response.data : c),
        currentClause: state.currentClause && state.currentClause.id === data.clauseId ? response.data : state.currentClause,
        isLoading: false
      }));
      return {
        success: true,
        message: "Cláusula atualizada com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível atualizar a cláusula.",
        isLoading: false 
      });
      throw err;
    }
  },

  deleteClause: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await clauseService.deleteClause(id);
      set((state) => ({
        clauses: state.clauses.filter((c) => c.id !== id),
        currentClause: state.currentClause && state.currentClause.id === id ? null : state.currentClause,
        isLoading: false
      }));
      return {
        success: true,
        message: "Cláusula excluída com sucesso",
        data: undefined
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível excluir a cláusula.",
        isLoading: false 
      });
      throw err;
    }
  },

  addClause: (clause) => set((state) => ({ clauses: [...state.clauses, clause] })),
  
  updateClauseInStore: (clause) => set((state) => ({
    clauses: state.clauses.map((c) => c.id === clause.id ? clause : c),
    currentClause: state.currentClause && state.currentClause.id === clause.id ? clause : state.currentClause,
  })),
  
  removeClause: (id) => set((state) => ({
    clauses: state.clauses.filter((c) => c.id !== id),
    currentClause: state.currentClause && state.currentClause.id === id ? null : state.currentClause,
  })),
  
  clearError: () => set({ error: null }),
})); 