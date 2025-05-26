import { api } from '@/lib/axios';
import { 
  CreateVenueDTO, 
  VenueListResponse, 
  VenueByIdResponse, 
  VenueUpdateResponse, 
  VenueCreateResponse, 
  VenueDeleteResponse, 
  VenueDashboardByIdResponse, 
  VenueAnalyticsResponse, 
  VenueAnalysisByMonthResponse, 
  VenueTrafficCountResponse, 
  GetVenueAnalysisByMonthParams, 
  GetVenueTrafficCountParams,
  TrafficSource,
  TrafficData,
  MonthData,
  AnalysisData
} from '@/types/venue';

export const venueService = {
  createVenue: async (data: CreateVenueDTO) => {
    const response = await api.post<VenueCreateResponse>('/venue/create', data);
    return response.data;
  },

  getAllVenues: async (organizationId: string) => {
    const response = await api.get<VenueListResponse>(`/venue/list?organizationId=${organizationId}`);
    return response.data;
  },

  getVenueById: async ({ venueId, userId }: { venueId: string, userId: string }) => {
    const response = await api.get<VenueByIdResponse>(`/venue/getById?venueId=${venueId}&userId=${userId}`);
    return response.data;
  },

  updateVenue: async (venueId: string, data: Partial<CreateVenueDTO>) => {
    const response = await api.put<VenueUpdateResponse>(`/venue/update`, { venueId, data });
    return response.data;
  },

  deleteVenue: async (id: string) => {
    const response = await api.delete<VenueDeleteResponse>(`/venue/delete/${id}`);
    return response.data;
  },

  getVenueDashBoardData: async (venueId: string, params?: { month?: string; year?: string }) => {
    const response = await api.get<VenueDashboardByIdResponse>(`/venue/analytics/${venueId}`, { params });
    return response.data;
  },

  getVenueAnalysisByMonth: async ({ venueId, year, approved }: GetVenueAnalysisByMonthParams) => {
    const response = await api.get<VenueAnalysisByMonthResponse>(`/venue/analysisByMonth?venueId=${venueId}&year=${year}${approved ? `&approved=${approved}` : ''}`);
    return response.data;
  },

  getVenueTrafficCount: async ({ venueId, year, approved }: GetVenueTrafficCountParams) => {
    const response = await api.get<VenueTrafficCountResponse>(`/venue/trafficCount?venueId=${venueId}&year=${year}${approved ? `&approved=${approved}` : ''}`);
    return response.data;
  }
}; 