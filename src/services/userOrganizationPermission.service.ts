import { api } from '@/lib/axios';
import {
  CreateUserOrganizationPermissionDTO,
  UpdateUserOrganizationPermissionDTO,
  UserOrganizationPermissionByIdResponse,
  UserOrganizationPermissionListResponse,
  UserOrganizationPermissionCreateResponse,
  UserOrganizationPermissionUpdateResponse,
  UserOrganizationPermissionDeleteResponse,
  GetUserOrganizationPermissionByIdDTO
} from '@/types/userOrganizationPermission';

export const userOrganizationPermissionService = {
  createUserOrganizationPermission: async (data: CreateUserOrganizationPermissionDTO) => {
    const response = await api.post<UserOrganizationPermissionCreateResponse>('/userOrganizationPermission/create', data);
    return response.data;
  },

  getAllUserOrganizationPermissions: async (params?: { userOrganizationPermissionId?: string }) => {
    const response = await api.get<UserOrganizationPermissionListResponse>(`/userOrganizationPermission/list`, { params });
    return response.data;
  },

  getUserOrganizationPermissionById: async ({ organizationId, userId }: { organizationId: string; userId: string }) => {
    const response = await 
    api.get<UserOrganizationPermissionByIdResponse>
    (`/userOrganizationPermission/byId?${organizationId ? `organizationId=${organizationId}`: ""}${userId ? `&userId=${userId}`: ""}`);
    return response.data;
  },

  updateUserOrganizationPermission: async (data: UpdateUserOrganizationPermissionDTO) => {
    const response = await api.put<UserOrganizationPermissionUpdateResponse>(`/userOrganizationPermission/update`, data);
    return response.data;
  },

  deleteUserOrganizationPermission: async (userOrganizationPermissionId: string) => {
    const response = await api.delete<UserOrganizationPermissionDeleteResponse>(`/userOrganizationPermission/delete/${userOrganizationPermissionId}`);
    return response.data;
  }
}; 