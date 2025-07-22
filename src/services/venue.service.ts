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
  UpdateVenueDTO,
  UpdateVenueInfoDTO
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
      if (key !== 'logoFile' && value !== undefined) {
        if (key === 'owners' && Array.isArray(value)) {
          // Para o array owners, converte para JSON string
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });
  
    // Adiciona o arquivo se existir
    if (data.logoFile) {
      formData.append('file', data.logoFile, data.logoFile.name);
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

  getVenueById: async ({ venueId, userId }: { venueId: string, userId?: string }) => {
    const response = await api.get<VenueByIdResponse>(`/venue/getById?venueId=${venueId}${userId ? `&userId=${userId}` : ''}`);
    return response.data;
  },

  updateVenue: async (data: UpdateVenueWithFileDTO) => {
    const formData = new FormData();
    
    // Adiciona todos os campos do DTO ao FormData
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'logoFile' && value !== undefined) {
        if (key === 'owners' && Array.isArray(value)) {
          // Para o array owners, converte para JSON string
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

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

  updateVenuePaymentInfo: async (data: {
    venueId: string;
    userId: string;
    pricePerDay?: string;
    pricePerPerson?: string;
    pricePerPersonDay?: string;
    pricePerPersonHour?: string;
    pricingModel: "PER_PERSON" | "PER_DAY" | "PER_PERSON_DAY" | "PER_PERSON_HOUR";
  }) => {
    const response = await api.put<VenueUpdateResponse>(
      '/venue/update/payment-info',
      {
        venueId: data.venueId,
        userId: data.userId,
        data: {
          pricePerDay: data.pricePerDay,
          pricePerPerson: data.pricePerPerson,
          pricePerPersonDay: data.pricePerPersonDay,
          pricePerPersonHour: data.pricePerPersonHour,
          pricingModel: data.pricingModel,
        },
      }
    );
    return response.data;
  },

  updateVenueInfo: async (data: UpdateVenueInfoDTO) => {
    const response = await api.put<VenueUpdateResponse>('/venue/update/info', data);
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