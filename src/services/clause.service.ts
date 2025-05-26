import { api } from '@/lib/axios';
import { CreateClauseDTO, ClauseListResponse, ClauseByIdResponse, ClauseUpdateResponse, ClauseCreateResponse, ClauseDeleteResponse, UpdateClauseDTO } from '@/types/clause';

export const clauseService = {
  createClause: async (data: CreateClauseDTO) => {
    const response = await api.post<ClauseCreateResponse>('/clause/create', data);
    return response.data;
  },

  getClausesList: async (organizationId: string) => {
    const response = await api.get<ClauseListResponse>(`/clause/list?organizationId=${organizationId}`);
    return response.data;
  },

  getClauseById: async (clauseId: string) => {
    const response = await api.get<ClauseByIdResponse>(`/clause/getById?clauseId=${clauseId}`);
    return response.data;
  },

  updateClause: async (data: Partial<UpdateClauseDTO>) => {
    const response = await api.put<ClauseUpdateResponse>(`/clause/update`,  data );
    return response.data;
  },

  deleteClause: async (id: string) => {
    const response = await api.delete<ClauseDeleteResponse>(`/clause/delete/${id}`);
    return response.data;
  }
}; 