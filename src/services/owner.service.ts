import { api } from '@/lib/axios';
import { 
  CreateOwnerDTO, 
  OwnerListResponse, 
  OwnerByIdResponse, 
  OwnerUpdateResponse, 
  OwnerCreateResponse, 
  OwnerDeleteResponse,
  CreateVenueOwnerRequestParams,
  CreateOrganizationOwnerRequestParams,
  ListOwnerByVenueIdQuerySchema
} from '@/types/owner';

export const ownerService = {
  createVenueOwner: async (data: CreateVenueOwnerRequestParams) => {
    const response = await api.post<OwnerCreateResponse>('/owner/createVenueOwner', data);
    return response.data;
  },

  createOrganizationOwner: async (data: CreateOrganizationOwnerRequestParams) => {
    const response = await api.post<OwnerCreateResponse>('/owner/createOrganizationOwner', data);
    return response.data;
  },

  getAllOrganizationOwners: async (organizationId: string) => {
    const response = await api.get<OwnerListResponse>(`/owner/listByOrganization?organizationId=${organizationId}`);
    return response.data;
  },

  getOwnersByVenueId: async (params: ListOwnerByVenueIdQuerySchema) => {
    const response = await api.get<OwnerListResponse>('/owner/listByVenue', { params });
    return response.data;
  },

  getOwnerById: async (ownerId: string) => {
    const response = await api.get<OwnerByIdResponse>(`/owner/getById?ownerId=${ownerId}`);
    return response.data;
  },

  updateOwner: async (ownerId: string, data: Partial<CreateOwnerDTO>) => {
    const response = await api.put<OwnerUpdateResponse>(`/owner/update`, { ownerId, data });
    return response.data;
  },

  deleteOwner: async (id: string) => {
    const response = await api.delete<OwnerDeleteResponse>(`/owner/delete/${id}`);
    return response.data;
  }
}; 