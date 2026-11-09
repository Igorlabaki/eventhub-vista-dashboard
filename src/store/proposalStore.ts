import { create } from 'zustand';
import { 
  Proposal, 
  CreateProposalPerPersonDTO, 
  CreateProposalPerDayDTO, 
  UpdateProposalPersonalInfoDTO,
  UpdateProposalPerDayDTO,
  UpdateProposalPerPersonDTO,
  ListProposalParams,
  ProposalListPagination,
  ProposalListSummary,
} from '@/types/proposal';
import { proposalService } from '@/services/proposal.service';
import { BackendResponse } from '@/lib/error-handler';

interface ProposalStore {
  proposals: Proposal[];
  events: Proposal[];
  currentProposal: Proposal | null;
  isLoading: boolean;
  isLoadingProposals: boolean;
  isLoadingEvents: boolean;
  proposalListPagination: ProposalListPagination | null;
  proposalListSummary: ProposalListSummary | null;
  proposalListError: string | null;
  eventListPagination: ProposalListPagination | null;
  eventListSummary: ProposalListSummary | null;
  eventListError: string | null;
  error: string | null;
  setProposals: (proposals: Proposal[]) => void;
  setEvents: (events: Proposal[]) => void;
  setCurrentProposal: (proposal: Proposal | null) => void;
  fetchProposals: (params: ListProposalParams) => Promise<void>;
  fetchEvents: (params: ListProposalParams) => Promise<void>;
  fetchProposalById: (proposalId: string) => Promise<Proposal>;
  createProposalPerPerson: (data: CreateProposalPerPersonDTO) => Promise<BackendResponse<Proposal>>;
  createProposalPerDay: (data: CreateProposalPerDayDTO) => Promise<BackendResponse<Proposal>>;
  updateProposalPerPerson: (data: UpdateProposalPerPersonDTO) => Promise<BackendResponse<Proposal>>;
  updateProposalPersonalInfo: (data: UpdateProposalPersonalInfoDTO) => Promise<BackendResponse<Proposal>>;
  updateProposalPerDay: (data: UpdateProposalPerDayDTO) => Promise<BackendResponse<Proposal>>;
  deleteProposal: (id: string) => Promise<BackendResponse<void>>;
  addProposal: (proposal: Proposal) => void;
  updateProposal: (proposal: Proposal) => void;
  removeProposal: (id: string) => void;
  clearError: () => void;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useProposalStore = create<ProposalStore>((set, get) => ({
  proposals: [],
  events: [],
  currentProposal: null,
  isLoading: false,
  isLoadingProposals: false,
  isLoadingEvents: false,
  proposalListPagination: null,
  proposalListSummary: null,
  proposalListError: null,
  eventListPagination: null,
  eventListSummary: null,
  eventListError: null,
  error: null,
  setProposals: (proposals) => set({ proposals }),
  setEvents: (events) => set({ events }),
  setCurrentProposal: (proposal) => set({ currentProposal: proposal }),
  
  fetchProposals: async (params) => {
    set({ isLoadingProposals: true, proposalListError: null });
    try {
      const response = await proposalService.listProposals(params);
      set({
        proposals: response.data.proposalList,
        proposalListPagination: response.pagination ?? null,
        proposalListSummary: response.data.summary ?? null,
      });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        proposalListError: error?.response?.data?.message || "Não foi possível carregar as propostas.",
        proposals: [],
        proposalListPagination: null,
        proposalListSummary: null,
      });
    } finally {
      set({ isLoadingProposals: false });
    }
  },

  fetchEvents: async (params) => {
    set({ isLoadingEvents: true, eventListError: null });
    try {
      const response = await proposalService.listProposals({ ...params, approved: true });
      set({
        events: response.data.proposalList,
        eventListPagination: response.pagination ?? null,
        eventListSummary: response.data.summary ?? null,
      });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        eventListError: error?.response?.data?.message || "Não foi possível carregar os eventos.",
        events: [],
        eventListPagination: null,
        eventListSummary: null,
      });
    } finally {
      set({ isLoadingEvents: false });
    }
  },

  fetchProposalById: async (proposalId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await proposalService.getProposalById(proposalId);
      set({ currentProposal: response.data });
      return response.data;
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar a proposta.",
        currentProposal: null 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createProposalPerPerson: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await proposalService.createProposalPerPerson(data);
      set((state) => ({ 
        proposals: [...(state.proposals || []), response.data],
        isLoading: false 
      }));
      return {
        success: true,
        message: "Proposta criada com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível criar a proposta.",
        isLoading: false 
      });
      throw err;
    }
  },

  createProposalPerDay: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await proposalService.createProposalPerDay(data);
      set((state) => ({ 
        proposals: [...(state.proposals || []), response.data],
        isLoading: false 
      }));
      return {
        success: true,
        message: "Proposta criada com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível criar a proposta.",
        isLoading: false 
      });
      throw err;
    }
  },

  updateProposalPerPerson: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await proposalService.updateProposalPerPerson(data);
      
      set((state) => ({
        proposals: (state.proposals || []).map((p) => p.id === response.data.id ? response.data : p),
        currentProposal: state.currentProposal && state.currentProposal.id === response.data.id ? response.data : state.currentProposal,
        isLoading: false
      }));
      return {
        success: true,
        message: "Proposta atualizada com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível atualizar a proposta.",
        isLoading: false 
      });
      throw err;
    }
  },

  updateProposalPersonalInfo: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await proposalService.updateProposalPersonalInfo(data);
      set((state) => ({
        proposals: (state.proposals || []).map((p) => p.id === response.data.id ? response.data : p),
        currentProposal: state.currentProposal && state.currentProposal.id === response.data.id ? response.data : state.currentProposal,
        isLoading: false
      }));
      return {
        success: true,
        message: "Proposta atualizada com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível atualizar a proposta.",
        isLoading: false 
      });
      throw err;
    }
  },

  updateProposalPerDay: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await proposalService.updateProposalPerDay(data);
      set((state) => ({
        proposals: (state.proposals || []).map((p) => p.id === response.data.id ? response.data : p),
        currentProposal: state.currentProposal && state.currentProposal.id === response.data.id ? response.data : state.currentProposal,
        isLoading: false
      }));
      return {
        success: true,
        message: "Proposta atualizada com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível atualizar a proposta.",
        isLoading: false 
      });
      throw err;
    }
  },

  deleteProposal: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await proposalService.deleteProposal(id);
      set((state) => ({
        proposals: (state.proposals || []).filter((p) => p.id !== id),
        currentProposal: state.currentProposal && state.currentProposal.id === id ? null : state.currentProposal,
        isLoading: false
      }));
      return {
        success: true,
        message: "Proposta excluída com sucesso",
        data: undefined
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível excluir a proposta.",
        isLoading: false 
      });
      throw err;
    }
  },

  addProposal: (proposal) => set((state) => ({ proposals: [...(state.proposals || []), proposal] })),
  
  updateProposal: (proposal) => set((state) => ({
    proposals: (state.proposals || []).map((p) => p.id === proposal.id ? proposal : p),
    currentProposal: state.currentProposal && state.currentProposal.id === proposal.id ? proposal : state.currentProposal,
  })),
  
  removeProposal: (id) => set((state) => ({
    proposals: (state.proposals || []).filter((p) => p.id !== id),
    currentProposal: state.currentProposal && state.currentProposal.id === id ? null : state.currentProposal,
  })),
  
  clearError: () => set({ error: null }),
})); 