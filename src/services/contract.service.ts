import { api } from '@/lib/axios';
import { CreateContractDTO, ContractListResponse, ContractByIdResponse, ContractUpdateResponse, ContractCreateResponse, ContractDeleteResponse, UpdateContractDTO } from '@/types/contract';

export const contractService = {
  createContract: async (data: CreateContractDTO) => {
    const response = await api.post<ContractCreateResponse>('/contract/create', data);
    return response.data;
  },

  getContractsList: async (organizationId: string) => {
    const response = await api.get<ContractListResponse>(`/contract/list?organizationId=${organizationId}`);
    return response.data;
  },

  getContractById: async (contractId: string) => {
    const response = await api.get<ContractByIdResponse>(`/contract/getById?contractId=${contractId}`);
    return response.data;
  },

  updateContract: async (data: Partial<UpdateContractDTO>) => {
    const response = await api.put<ContractUpdateResponse>(`/contract/update`,  data );
    return response.data;
  },

  deleteContract: async (id: string) => {
    const response = await api.delete<ContractDeleteResponse>(`/contract/delete/${id}`);
    return response.data;
  }
}; 