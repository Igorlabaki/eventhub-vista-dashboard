import { api } from '@/lib/axios';
import { CreateOrganizationDTO, OrganizationListResponse, OrganizationByIdResponse, OrganizationUpdateResponse, OrganizationCreateResponse, OrganizationDeleteResponse } from '@/types/organization';

export const organizationService = {
  createOrganization: async (data: CreateOrganizationDTO) => {
    const response = await api.post<OrganizationCreateResponse>('/organization/create', data);
    return response.data;
  },

  getAllOrganizations: async (userId: string) => {
    const response = await api.get<OrganizationListResponse>(`/organization/list?userId=${userId}`);
    return response.data;
  },

  getOrganizationById: async (organizationId: string) => {
    const response = await api.get<OrganizationByIdResponse>(`/organization/getById?organizationId=${organizationId}`);
    return response.data;
  },

  updateOrganization: async (organizationId: string, data: Partial<CreateOrganizationDTO>) => {
    const response = await api.put<OrganizationUpdateResponse>(`/organization/update`, { organizationId, data });
    return response.data;
  },

  deleteOrganization: async (id: string) => {
    const response = await api.delete<OrganizationDeleteResponse>(`/organization/delete/${id}`);
    return response.data;
  }
}; 