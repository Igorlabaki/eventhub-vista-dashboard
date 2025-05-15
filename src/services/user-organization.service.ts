import { api } from '@/lib/axios';
import { UpdateUserOrganizationDTO, UserOrganizationDeleteResponse, UserOrganizationListResponse, UserOrganizationUpdateResponse } from '@/types/userOrganization';
import { CreateUserOrganizationDTO } from '@/types/userOrganization';
import { UserOrganizationCreateResponse } from '@/types/userOrganization';    

export const userOrganizationService = {
  createUserOrganization: async (data: CreateUserOrganizationDTO) => {
    const response = await api.post<UserOrganizationCreateResponse>('/userOrganization/create', data);
    return response.data;
  },

  getAllUserOrganizations: async (organizationId: string) => {
    const response = await api.get<UserOrganizationListResponse>(`/userOrganization/byOrganizationlist?organizationId=${organizationId}`);
    return response.data;
  },

  updateUserOrganization: async (userOrganizationId: string, data: Partial<UpdateUserOrganizationDTO>) => {
    const response = await api.put<UserOrganizationUpdateResponse>(`/userOrganization/update`, { userOrganizationId, data });
    return response.data;
  },

  deleteUserOrganization: async (id: string) => {
    const response = await api.delete<UserOrganizationDeleteResponse>(`/userOrganization/delete/${id}`);
    return response.data;
  }
}; 