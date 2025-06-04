import { create } from 'zustand';
import { 
  Contract, 
  CreateContractDTO, 
  UpdateContractDTO,
  ListContractParams
} from '@/types/contract';
import { contractService } from '@/services/contract.service';
import { BackendResponse } from '@/lib/error-handler';

interface ContractStore {
  contracts: Contract[];
  currentContract: Contract | null;
  isLoading: boolean;
  error: string | null;
  setContracts: (contracts: Contract[]) => void;
  setCurrentContract: (contract: Contract | null) => void;
  fetchContracts: (params: ListContractParams) => Promise<void>;
  fetchContractById: (contractId: string) => Promise<void>;
  createContract: (data: CreateContractDTO) => Promise<BackendResponse<Contract>>;
  updateContract: (data: UpdateContractDTO) => Promise<BackendResponse<Contract>>;
  deleteContract: (id: string) => Promise<BackendResponse<void>>;
  addContract: (contract: Contract) => void;
  updateContractInStore: (contract: Contract) => void;
  removeContract: (id: string) => void;
  clearError: () => void;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useContractStore = create<ContractStore>((set, get) => ({
  contracts: [],
  currentContract: null,
  isLoading: false,
  error: null,
  setContracts: (contracts) => set({ contracts }),
  setCurrentContract: (contract) => set({ currentContract: contract }),
  
  fetchContracts: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contractService.listContracts(params);
      set({ contracts: response.data.contractList });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar os contratos.",
        contracts: [] 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchContractById: async (contractId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contractService.getContractById(contractId);
      set({ currentContract: response.data });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar o contrato.",
        currentContract: null 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createContract: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contractService.createContract(data);
      set((state) => ({ 
        contracts: [...state.contracts, response.data],
        isLoading: false 
      }));
      return {
        success: true,
        message: "Contrato criado com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível criar o contrato.",
        isLoading: false 
      });
      throw err;
    }
  },

  updateContract: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contractService.updateContract(data);
      set((state) => ({
        contracts: state.contracts.map((c) => c.id === response.data.id ? response.data : c),
        currentContract: state.currentContract && state.currentContract.id === response.data.id ? response.data : state.currentContract,
        isLoading: false
      }));
      return {
        success: true,
        message: "Contrato atualizado com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível atualizar o contrato.",
        isLoading: false 
      });
      throw err;
    }
  },

  deleteContract: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await contractService.deleteContract(id);
      set((state) => ({
        contracts: state.contracts.filter((c) => c.id !== id),
        currentContract: state.currentContract && state.currentContract.id === id ? null : state.currentContract,
        isLoading: false
      }));
      return {
        success: true,
        message: "Contrato excluído com sucesso",
        data: undefined
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível excluir o contrato.",
        isLoading: false 
      });
      throw err;
    }
  },

  addContract: (contract) => set((state) => ({ contracts: [...state.contracts, contract] })),
  
  updateContractInStore: (contract) => set((state) => ({
    contracts: state.contracts.map((c) => c.id === contract.id ? contract : c),
    currentContract: state.currentContract && state.currentContract.id === contract.id ? contract : state.currentContract,
  })),
  
  removeContract: (id) => set((state) => ({
    contracts: state.contracts.filter((c) => c.id !== id),
    currentContract: state.currentContract && state.currentContract.id === id ? null : state.currentContract,
  })),
  
  clearError: () => set({ error: null }),
})); 