import { api } from '@/lib/axios';
import { 
  CreateProposalPerPersonDTO, 
  CreateProposalPerDayDTO,
  UpdateProposalPersonalInfoDTO,
  UpdateProposalPerDayDTO,
  UpdateProposalPerPersonDTO,
  ListProposalParams,
  ProposalListResponse, 
  ProposalByIdResponse, 
  ProposalUpdateResponse, 
  ProposalCreateResponse, 
  ProposalDeleteResponse 
} from '@/types/proposal';

export const proposalService = {
  createProposalPerPerson: async (data: CreateProposalPerPersonDTO) => {
    const response = await api.post<ProposalCreateResponse>('/proposal/createPerPerson', data);
    return response.data;
  },

  createProposalPerDay: async (data: CreateProposalPerDayDTO) => {
    const response = await api.post<ProposalCreateResponse>('/proposal/createPerDay', data);
    return response.data;
  },

  getProposalById: async (proposalId: string) => {
    const response = await api.get<ProposalByIdResponse>(`/proposal/byId/${proposalId}`);
    return response.data;
  },

  updateProposalPerPerson: async (data: UpdateProposalPerPersonDTO) => {
    const response = await api.put<ProposalUpdateResponse>('/proposal/updatePerPerson', data);
    return response.data;
  },

  updateProposalPersonalInfo: async (data: UpdateProposalPersonalInfoDTO) => {
    const response = await api.put<ProposalUpdateResponse>('/proposal/updatePersonalInfo', data);
    return response.data;
  },

  updateProposalPerDay: async (data: UpdateProposalPerDayDTO) => {
    const response = await api.put<ProposalUpdateResponse>('/proposal/updatePerDay', data);
    return response.data;
  },

  listProposals: async (params: ListProposalParams) => {
    const queryParams = new URLSearchParams();
    if (params.venueId) queryParams.append('venueId', params.venueId);
    if (params.completeClientName) queryParams.append('completeClientName', params.completeClientName);
    if (params.email) queryParams.append('email', params.email);
    if (params.month) queryParams.append('month', params.month);
    if (params.year) queryParams.append('year', params.year);
    if (params.approved !== undefined) queryParams.append('approved', params.approved.toString());

    const response = await api.get<ProposalListResponse>(`/proposal/list?${queryParams.toString()}`);
    return response.data;
  },

  deleteProposal: async (proposalId: string) => {
    const response = await api.delete<ProposalDeleteResponse>(`/proposal/delete/${proposalId}`);
    return response.data;
  }
}; 