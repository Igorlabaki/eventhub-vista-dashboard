import { api } from '@/lib/axios';
import { CreateVenueDTO, VenueListResponse, VenueByIdResponse, VenueUpdateResponse, VenueCreateResponse, VenueDeleteResponse } from '@/types/venue';

export const venueService = {
  createVenue: async (data: CreateVenueDTO) => {
    const response = await api.post<VenueCreateResponse>('/venue/create', data);
    return response.data;
  },

  getAllVenues: async (organizationId: string) => {
    const response = await api.get<VenueListResponse>(`/venue/list?organizationId=${organizationId}`);
    return response.data;
  },

  getVenueById: async (id: string) => {
    const response = await api.get<VenueByIdResponse>(`/venue/byId/${id}`);
    return response.data;
  },

  updateVenue: async (venueId: string, data: Partial<CreateVenueDTO>) => {
    const response = await api.put<VenueUpdateResponse>(`/venue/update`, { venueId, data });
    return response.data;
  },

  deleteVenue: async (id: string) => {
    const response = await api.delete<VenueDeleteResponse>(`/venue/delete/${id}`);
    return response.data;
  }
}; 