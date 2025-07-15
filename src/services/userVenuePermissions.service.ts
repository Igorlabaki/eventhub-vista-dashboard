import { api } from '@/lib/axios';
import { 
  UpdateUserVenuePermissionDTO,
  UserVenuePermissionListResponse, 
  UserVenuePermissionByIdResponse, 
  UserVenuePermissionUpdateResponse, 
  UserVenuePermissionCreateResponse, 
  UserVenuePermissionDeleteResponse, 
  CreateUserVenuePermissionDTO, 
  GetUserVenuePermissionDTO 
} from '@/types/userVenuePermissions';

export const userVenuePermissionService = {
  createUserVenuePermission: async (data: CreateUserVenuePermissionDTO) => {
    const response = await api.post<UserVenuePermissionCreateResponse>('/userVenuePermission/create', data);
    return response.data;
  },

  getAllUserVenuePermissions: async (organizationId: string) => {
    const response = await api.get<UserVenuePermissionListResponse>(`/userVenuePermission/list?organizationId=${organizationId}`);
    return response.data;
  },

  getUserVenuePermissionById: async (id: string) => {
    const response = await api.get<UserVenuePermissionByIdResponse>(`/userVenuePermission/${id}`);
    return response.data;
  },

  getUserVenuePermission: async (params: GetUserVenuePermissionDTO) => {
    const response = await api.get<UserVenuePermissionByIdResponse>(`/userVenuePermission/get`, { params });
    return response.data;
  },

  updateUserVenuePermission: async (data: UpdateUserVenuePermissionDTO) => {
    const response = await api.put<UserVenuePermissionUpdateResponse>(`/userVenuePermission/update`,  data );
    return response.data;
  },

  deleteUserVenuePermission: async (id: string) => {
    const response = await api.delete<UserVenuePermissionDeleteResponse>(`/userVenuePermission/delete/${id}`);
    return response.data;
  }
}; 