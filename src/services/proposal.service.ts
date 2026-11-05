import { api } from '@/lib/axios';
import { 
  CreateProposalPerPersonDTO, 
  CreateProposalPerDayDTO,
  UpdateProposalPersonalInfoDTO,
  UpdateProposalPerDayDTO,
  UpdateProposalPerPersonDTO,
  ListProposalParams,
  ProposalListResponse, 
  ProposalByIdResponse, 
  ProposalUpdateResponse, 
  ProposalCreateResponse, 
  ProposalDeleteResponse 
} from '@/types/proposal';

export type RecalculatePublicProposalData = {
  id: string;
  startDate: string;
  endDate: string;
  guestNumber: number;
  basePrice: number;
  extraHoursQty: number;
  extraHourPrice: number;
  totalAmount: number;
};

export type PublicServiceChoice = {
  id: string;
  name: string;
  amount: number;
  required: boolean;
  minPeople: number | null;
  selected: boolean;
  hourly?: boolean;
  hours?: number | null;
};

export type PublicIndication = {
  id: string;
  name: string;
  role: string | null;
  whatsapp: string;
  email: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  url: string | null;
  category?: string | null;
  logoUrl?: string | null;
  description?: string | null;
};

export type PublicProposalServicesUpdate = {
  id: string;
  totalAmount: number;
  proposalServices: {
    id: string;
    serviceId: string;
    amount: number;
    service: {
      name: string;
      rpaRequired: boolean;
      rpaMinPeople: number | null;
    };
  }[];
};

export interface ProposalPresentation {
  name: string;
  description: string | null;
  logoUrl: string | null;
  city: string;
  state: string;
  neighborhood: string;
  street: string;
  streetNumber: string;
  maxGuest: number;
  hasOvernightStay: boolean;
  checkIn: string | null;
  checkOut: string | null;
  minimumNights: number | null;
  openingHour: string | null;
  closingHour: string | null;
  url: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  tourVideoUrl: string | null;
  whatsappNumber: string | null;
  proposalPrimaryColor: string | null;
  proposalSecondaryColor: string | null;
  proposalTextColor: string | null;
  canReorder: boolean;
  images: { id: string; imageUrl: string; description: string | null; position: number }[];
  catalog: { id: string; imageUrl: string; description: string | null; position: number; isShowOnProposal: boolean }[];
  amenities: { name: string; position: number }[];
}

export interface ProposalPresentationResponse {
  success: boolean;
  message: string;
  data: ProposalPresentation;
  count: number;
  type: string;
}

export const proposalService = {
  createProposalPerPerson: async (data: CreateProposalPerPersonDTO) => {
    const response = await api.post<ProposalCreateResponse>('/proposal/createPerPerson', data);
    return response.data;
  },

  createProposalPerDay: async (data: CreateProposalPerDayDTO) => {
    const response = await api.post<ProposalCreateResponse>('/proposal/createPerDay', data);
    return response.data;
  },

  getProposalById: async (proposalId: string) => {
    const response = await api.get<ProposalByIdResponse>(`/proposal/byId/${proposalId}`);
    return response.data;
  },

  getProposalPresentation: async (proposalId: string) => {
    const response = await api.get<ProposalPresentationResponse>(`/proposal/presentation/${proposalId}`);
    return response.data;
  },

  reorderProposalImages: async (proposalId: string, imageIds: string[]) => {
    const response = await api.put<ProposalPresentationResponse>(`/proposal/presentation/${proposalId}/image-order`, { imageIds });
    return response.data;
  },

  chooseProposalImage: async (proposalId: string, slotId: string, replacementId: string) => {
    const response = await api.put<{
      success: boolean;
      message: string;
      data: { images: ProposalPresentation["images"]; catalog: ProposalPresentation["catalog"] };
    }>(`/proposal/presentation/${proposalId}/image-choice`, { slotId, replacementId });
    return response.data;
  },

  updateProposalPerPerson: async (data: UpdateProposalPerPersonDTO) => {
    const response = await api.put<ProposalUpdateResponse>('/proposal/updatePerPerson', data);
    return response.data;
  },

  updateProposalPersonalInfo: async (data: UpdateProposalPersonalInfoDTO) => {
    const response = await api.put<ProposalUpdateResponse>('/proposal/updatePersonalInfo', data);
    return response.data;
  },

  updateProposalPerDay: async (data: UpdateProposalPerDayDTO) => {
    const response = await api.put<ProposalUpdateResponse>('/proposal/updatePerDay', data);
    return response.data;
  },

  listProposals: async (params: ListProposalParams) => {
    const queryParams = new URLSearchParams();
    if (params.venueId) queryParams.append('venueId', params.venueId);
    if (params.completeClientName) queryParams.append('completeClientName', params.completeClientName);
    if (params.email) queryParams.append('email', params.email);
    if (params.month) queryParams.append('month', params.month);
    if (params.year) queryParams.append('year', params.year);
    if (params.day) queryParams.append('day', params.day);
    if (params.page) queryParams.append('page', params.page);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDir) queryParams.append('sortDir', params.sortDir);
    if (params.summary) queryParams.append('summary', 'true');
    if (params.approved !== undefined) queryParams.append('approved', params.approved.toString());
    if (params.minAmount !== undefined) queryParams.append('minAmount', String(params.minAmount));

    const response = await api.get<ProposalListResponse>(`/proposal/list?${queryParams.toString()}`);
    return response.data;
  },

  recalculatePublicProposal: async (
    proposalId: string,
    data: { date: string; guestNumber: number; hours: number },
  ) => {
    const response = await api.put<{ success: boolean; message: string; data: RecalculatePublicProposalData }>(
      `/proposal/presentation/${proposalId}/recalculate`,
      data,
    );
    return response.data;
  },

  listPublicProposalServices: async (proposalId: string) => {
    const response = await api.get<{ success: boolean; message: string; data: { services: PublicServiceChoice[] } }>(
      `/proposal/presentation/${proposalId}/services`,
    );
    return response.data;
  },

  updatePublicProposalServices: async (
    proposalId: string,
    serviceIds: string[],
    serviceHours?: { serviceId: string; hours: number }[],
  ) => {
    const response = await api.put<{ success: boolean; message: string; data: PublicProposalServicesUpdate }>(
      `/proposal/presentation/${proposalId}/services`,
      { serviceIds, serviceHours },
    );
    return response.data;
  },

  listProposalIndications: async (proposalId: string) => {
    const response = await api.get<{
      success: boolean;
      message: string;
      data: { indications: PublicIndication[] };
    }>(`/proposal/indications/${proposalId}`);
    return response.data;
  },

  replaceProposalIndications: async (proposalId: string, contactIds: string[]) => {
    const response = await api.put<{
      success: boolean;
      message: string;
      data: { contactIds: string[] };
    }>(`/proposal/indications/${proposalId}`, { contactIds });
    return response.data;
  },

  deleteProposal: async (proposalId: string) => {
    const response = await api.delete<ProposalDeleteResponse>(`/proposal/delete/${proposalId}`);
    return response.data;
  }
}; 