import { api } from '@/lib/axios';
import { UpdateUserPermissionDTO,UserPermissionListResponse, UserPermissionByIdResponse, UserPermissionUpdateResponse, UserPermissionCreateResponse, UserPermissionDeleteResponse, CreateUserPermissionDTO } from '@/types/userPermissions';

export const userPermissionService = {
  createUserPermission: async (data: CreateUserPermissionDTO) => {
    const response = await api.post<UserPermissionCreateResponse>('/userPermission/create', data);
    return response.data;
  },

  getAllUserPermissions: async (userId: string) => {
    const response = await api.get<UserPermissionListResponse>(`/userPermission/list?userId=${userId}`);
    return response.data;
  },

  updateUserPermission: async (data: UpdateUserPermissionDTO) => {
    const response = await api.put<UserPermissionUpdateResponse>(`/userPermission/update`,  data );
    return response.data;
  },

  deleteUserPermission: async (id: string) => {
    const response = await api.delete<UserPermissionDeleteResponse>(`/userpermission/delete/${id}`);
    return response.data;
  }
}; 