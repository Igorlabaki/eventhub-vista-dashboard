import { create } from 'zustand';
import { 
  Proposal, 
  CreateProposalPerPersonDTO, 
  CreateProposalPerDayDTO, 
  UpdateProposalPersonalInfoDTO,
  UpdateProposalPerDayDTO,
  UpdateProposalPerPersonDTO,
  ListProposalParams
} from '@/types/proposal';
import { proposalService } from '@/services/proposal.service';
import { BackendResponse } from '@/lib/error-handler';

interface ProposalStore {
  proposals: Proposal[];
  events: Proposal[];
  currentProposal: Proposal | null;
  isLoading: boolean;
  error: string | null;
  setProposals: (proposals: Proposal[]) => void;
  setEvents: (events: Proposal[]) => void;
  setCurrentProposal: (proposal: Proposal | null) => void;
  fetchProposals: (params: ListProposalParams) => Promise<void>;
  fetchEvents: (params: ListProposalParams) => Promise<void>;
  fetchProposalById: (proposalId: string) => Promise<void>;
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
  error: null,
  setProposals: (proposals) => set({ proposals }),
  setEvents: (events) => set({ events }),
  setCurrentProposal: (proposal) => set({ currentProposal: proposal }),
  
  fetchProposals: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await proposalService.listProposals(params);
      set({ proposals: response.data.proposalList });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar as propostas.",
        proposals: [] 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchEvents: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await proposalService.listProposals({ ...params, approved: true });
      set({ events: response.data.proposalList });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar os eventos.",
        events: [] 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProposalById: async (proposalId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await proposalService.getProposalById(proposalId);
      set({ currentProposal: response.data });
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
      console.log(response, "response");
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