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
  AnalysisData,
  UpdateVenueDTO
} from '@/types/venue';

export type CreateVenueWithFileDTO = Omit<CreateVenueDTO, 'imageUrl'> & {
  file?: File;
};

export type UpdateVenueWithFileDTO = Omit<UpdateVenueDTO, 'imageUrl'> & {
  file?: File;
};

export const venueService = {
  createVenue: async (data: CreateVenueWithFileDTO) => {
    const formData = new FormData();
    
    // Adiciona todos os campos do DTO ao FormData
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'file' && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    console.log("data.file", data.file)
    // Adiciona o arquivo se existir
    if (data.file) {
      formData.append('file', data.file, data.file.name);
    }

    const response = await api.post<VenueCreateResponse>('/venue/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAllVenues: async ({ organizationId, userId }: { organizationId: string, userId: string }) => {
    const response = await api.get<VenueListResponse>(`/venue/permittedVenueList?organizationId=${organizationId}&userId=${userId}`);
    return response.data;
  },

  getVenueById: async ({ venueId, userId }: { venueId: string, userId: string }) => {
    const response = await api.get<VenueByIdResponse>(`/venue/getById?venueId=${venueId}&userId=${userId}`);
    return response.data;
  },

  updateVenue: async (data: UpdateVenueWithFileDTO) => {
    const formData = new FormData();
    
    // Adiciona todos os campos do DTO ao FormData
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'logoFile' && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    console.log("data.logoFile", data.logoFile)
    // Adiciona o arquivo se existir
    if (data.logoFile) {
      formData.append('file', data.logoFile, data.logoFile.name);
    }

    const response = await api.put<VenueUpdateResponse>('/venue/update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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