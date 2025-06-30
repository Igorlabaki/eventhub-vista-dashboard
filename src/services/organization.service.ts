import { api } from '@/lib/axios';
import { CreateOrganizationDTO, OrganizationListResponse, OrganizationByIdResponse, OrganizationUpdateResponse, OrganizationCreateResponse, OrganizationDeleteResponse, UpdateOrganizationDTO } from '@/types/organization';

export const organizationService = {
  createOrganization: async (data: CreateOrganizationDTO) => {
    const formData = new FormData();

    // Adiciona todos os campos do DTO ao FormData
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'logoFile' && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    if (data.logoFile) {
      formData.append('file', data.logoFile, data.logoFile.name);
    }

    const response = await api.post<OrganizationCreateResponse>('/organization/create', formData);
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

  updateOrganization: async (data: UpdateOrganizationDTO) => {
    const formData = new FormData();

    // Adiciona todos os campos do DTO ao FormData
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'logoFile' && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    if (data.logoFile) {
      formData.append('file', data.logoFile, data.logoFile.name);
    }

    const response = await api.put<OrganizationUpdateResponse>(`/organization/update`, formData);
    return response.data;
  },

  deleteOrganization: async (id: string) => {
    const response = await api.delete<OrganizationDeleteResponse>(`/organization/delete/${id}`);
    return response.data;
  }
}; 