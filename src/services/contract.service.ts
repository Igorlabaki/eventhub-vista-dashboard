import { api } from '@/lib/axios';
import { 
  CreateContractDTO,
  UpdateContractDTO,
  ListContractParams,
  ContractListResponse,
  ContractByIdResponse,
  ContractUpdateResponse,
  ContractCreateResponse,
  ContractDeleteResponse
} from '@/types/contract';

export const contractService = {
  createContract: async (data: CreateContractDTO) => {
    const response = await api.post<ContractCreateResponse>('/contract/create', data);
    return response.data;
  },

  getContractById: async (contractId: string) => {
    const response = await api.get<ContractByIdResponse>(`/contract/getById/${contractId}`);
    return response.data;
  },

  updateContract: async (data: UpdateContractDTO) => {
    const response = await api.put<ContractUpdateResponse>('/contract/update', data);
    return response.data;
  },

  listContracts: async (params: ListContractParams) => {
    const queryParams = new URLSearchParams();
    if (params.organizationId) queryParams.append('organizationId', params.organizationId);
    if (params.title) queryParams.append('title', params.title);
    if (params.venueId) queryParams.append('venueId', params.venueId);

    const response = await api.get<ContractListResponse>(`/contract/list?${queryParams.toString()}`);
    return response.data;
  },

  deleteContract: async (contractId: string) => {
    const response = await api.delete<ContractDeleteResponse>(`/contract/delete/${contractId}`);
    return response.data;
  }
}; 