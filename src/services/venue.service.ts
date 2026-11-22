import { api } from '@/lib/axios';
import type { VenueDomainView } from '@/lib/venue-domain';
import type { EditorVenueLink, VenueLinkRow } from '@/lib/venue-link';
import type { VenuePresentation } from '@/lib/venue-presentation';
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
  UpdateVenueInfoDTO,
  ReportBlockParams,
  ReportBlockResponse,
  OccupancyData,
  LeadTimeData,
  ServiceAdherenceData,
  EventProfileData,
  EventOriginData,
  AdsReportData,
} from '@/types/venue';

export type CreateVenueWithFileDTO = Omit<CreateVenueDTO, 'imageUrl'> & {
  file?: File;
};

export type UpdateVenueWithFileDTO = Omit<UpdateVenueDTO, 'imageUrl'> & {
  file?: File;
};

export type PublicVenueLink = {
  kind: string;
  label: string;
  href: string;
  subtitle?: string;
};

export type PublicVenueLinks = {
  name: string;
  logoUrl: string | null;
  slogan: string | null;
  proposalPrimaryColor: string | null;
  proposalSecondaryColor: string | null;
  proposalTextColor: string | null;
  mapLabel?: string | null;
  mapQuery?: string | null;
  tourVideoUrl?: string | null;
  canReorder: boolean;
  usedKinds?: string[];
  links: PublicVenueLink[];
};

export function appendVenueImageFiles(
  formData: FormData,
  data: { logoFile?: File; faviconFile?: File },
) {
  if (data.logoFile) formData.append("file", data.logoFile, data.logoFile.name);
  if (data.faviconFile) formData.append("favicon", data.faviconFile, data.faviconFile.name);
}

export const venueService = {
  createVenue: async (data: CreateVenueWithFileDTO) => {
    const formData = new FormData();
    
    // Adiciona todos os campos do DTO ao FormData
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'logoFile' && key !== 'faviconFile' && value !== undefined) {
        if (key === 'owners' && Array.isArray(value)) {
          // Para o array owners, converte para JSON string
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });
  
    // Adiciona o arquivo se existir
    appendVenueImageFiles(formData, data);

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
    const response = await api.get<VenueByIdResponse>(`/venue/getById?venueId=${encodeURIComponent(venueId)}${userId ? `&userId=${userId}` : ''}`);
    return response.data;
  },

  updateVenue: async (data: UpdateVenueWithFileDTO) => {
    const formData = new FormData();
    
    // Adiciona todos os campos do DTO ao FormData
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'logoFile' && key !== 'faviconFile' && value !== undefined) {
        if (key === 'owners' && Array.isArray(value)) {
          // Para o array owners, converte para JSON string
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Adiciona o arquivo se existir
    appendVenueImageFiles(formData, data);

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

  getVenueAnalysisByMonth: async ({ venueId, year, approved, average }: GetVenueAnalysisByMonthParams) => {
    const response = await api.get<VenueAnalysisByMonthResponse>(`/venue/analysisByMonth?venueId=${venueId}&year=${year}${approved ? `&approved=${approved}` : ''}${average ? '&average=true' : ''}`);
    return response.data;
  },

  getVenueTrafficCount: async ({ venueId, year, approved }: GetVenueTrafficCountParams) => {
    const response = await api.get<VenueTrafficCountResponse>(`/venue/trafficCount?venueId=${venueId}&year=${year}${approved ? `&approved=${approved}` : ''}`);
    return response.data;
  },

  getReportOccupancy: async ({ venueId, year, month }: ReportBlockParams) => {
    const response = await api.get<ReportBlockResponse<OccupancyData>>('/venue/reports/occupancy', {
      params: { venueId, year, month },
    });
    return response.data;
  },

  getReportLeadTime: async ({ venueId, year, eventCategory }: ReportBlockParams) => {
    const response = await api.get<ReportBlockResponse<LeadTimeData>>('/venue/reports/lead-time', {
      params: { venueId, year, eventCategory },
    });
    return response.data;
  },

  getReportServiceAdherence: async ({ venueId, year, eventCategory }: ReportBlockParams) => {
    const response = await api.get<ReportBlockResponse<ServiceAdherenceData>>('/venue/reports/service-adherence', {
      params: { venueId, year, eventCategory },
    });
    return response.data;
  },

  getReportEventProfile: async ({ venueId, year }: ReportBlockParams) => {
    const response = await api.get<ReportBlockResponse<EventProfileData>>('/venue/reports/event-profile', {
      params: { venueId, year },
    });
    return response.data;
  },

  getReportEventOrigin: async ({ venueId, year }: ReportBlockParams) => {
    const response = await api.get<ReportBlockResponse<EventOriginData>>('/venue/reports/event-origin', {
      params: { venueId, year },
    });
    return response.data;
  },

  getReportAds: async ({ venueId, year }: ReportBlockParams) => {
    const response = await api.get<ReportBlockResponse<AdsReportData>>('/venue/reports/ads', {
      params: { venueId, year },
    });
    return response.data;
  },

  getVenueLinks: async (venueId: string) => {
    const response = await api.get<{ data: PublicVenueLinks }>(`/venue/links/${encodeURIComponent(venueId)}`);
    return response.data.data;
  },

  getVenueLinkEditor: async (venueId: string) => {
    const response = await api.get<{ data: { links: EditorVenueLink[] } }>(`/venue/links/${encodeURIComponent(venueId)}/editor`);
    return response.data.data;
  },

  saveVenueLinks: async (venueId: string, links: VenueLinkRow[]) => {
    await api.put(`/venue/links/${encodeURIComponent(venueId)}`, {
      links: links.map(({ kind, url, visible, position }) => ({ kind, url, visible, position })),
    });
  },

  orderVenueLinks: async (venueId: string, kinds: string[]) => {
    const response = await api.put<{ data: PublicVenueLinks }>(`/venue/links/${encodeURIComponent(venueId)}/order`, { kinds });
    return response.data.data;
  },

  hideVenueLink: async (venueId: string, kind: string) => {
    const response = await api.put<{ data: PublicVenueLinks }>(`/venue/links/${encodeURIComponent(venueId)}/hide`, { kind });
    return response.data.data;
  },

  setVenueLinkVisible: async (venueId: string, body: { kind: string; visible: boolean }) => {
    await api.put(`/venue/links/${encodeURIComponent(venueId)}/visible`, {
      kind: body.kind,
      visible: body.visible,
    });
  },

  createVenueLink: async (venueId: string, body: { kind: string; url?: string | null; visible?: boolean }) => {
    const response = await api.put<{ data: PublicVenueLinks }>(`/venue/links/${encodeURIComponent(venueId)}/create`, {
      kind: body.kind,
      url: body.url ?? undefined,
      visible: body.visible,
    });
    return response.data.data;
  },

  resolveVenueDomain: async (host: string) => {
    const response = await api.get<{ venueId: string; name: string }>("/venue/domain/resolve", { params: { host } });
    return response.data;
  },

  getVenueDomain: async (venueId: string) => {
    const response = await api.get<{ data: VenueDomainView }>(`/venue/domain/${encodeURIComponent(venueId)}`);
    return response.data.data;
  },

  saveVenueDomain: async (venueId: string, hostname: string) => {
    const response = await api.put<{ data: VenueDomainView }>(`/venue/domain/${encodeURIComponent(venueId)}`, { hostname });
    return response.data.data;
  },

  deleteVenueDomain: async (venueId: string) => {
    const response = await api.delete<{ data: VenueDomainView }>(`/venue/domain/${encodeURIComponent(venueId)}`);
    return response.data.data;
  },

  getVenuePresentation: async (venueId: string) => {
    const response = await api.get<{ data: VenuePresentation }>(`/venue/presentation/${encodeURIComponent(venueId)}`);
    return response.data.data;
  },

  reorderVenueImages: async (venueId: string, imageIds: string[]) => {
    await api.put(`/venue/presentation/${encodeURIComponent(venueId)}/image-order`, { imageIds });
  },

  chooseVenueImage: async (venueId: string, slotId: string, replacementId: string) => {
    const response = await api.put<{ data: { images: VenuePresentation["images"]; catalog: VenuePresentation["catalog"] } }>(
      `/venue/presentation/${encodeURIComponent(venueId)}/image-choice`,
      { slotId, replacementId },
    );
    return response.data.data;
  },
}; 