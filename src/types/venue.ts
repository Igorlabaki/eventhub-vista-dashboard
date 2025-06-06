import { DateEvent } from "./date-event";
import { Organization } from "./organization";


export interface Venue {
  id: string;
  name: string;
  email?: string | null;
  url?: string | null;
  tiktokUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  logoUrl?: string | null;
  street: string;
  streetNumber: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  checkIn?: string | null;
  checkOut?: string | null;
  cep: string;
  hasOvernightStay: boolean;
  createdAt: Date;
  organizationId: string;
  pricingModel: string; // Se for enum, troque para o tipo do enum
  pricePerPerson?: number | null;
  pricePerDay?: number | null;
  pricePerPersonDay?: number | null;
  pricePerPersonHour?: number | null;
  maxGuest: number;

  // Relacionamentos (ajuste os tipos conforme seus models)
  organization: Organization;
  dateEvent: DateEvent[];
  /*texts: any[];
  contacts: any[];
  images: any[];
  expenses: any[];
  services: any[];
  Payment: any[];
  questions: any[];
  proposals: any[];
  
  ownerVenue: any[];
  notifications: any[];
  UserPermission: any[];
  seasonalFee: any[];
  contracts: any[];
  attachments: any[];
  goals: any[]; */
};

export interface CreateVenueDTO {
  userId: string;
  organizationId: string;
  data: {
    cep: string;
    email: string;
    name: string;
    url?: string;
    city: string;
    state: string;
    street: string;
    tiktokUrl?: string;
    instagramUrl?: string;
    facebookUrl?: string;
    logoUrl?: string;
    logoFile?: File;
    checkIn?: string;
    maxGuest: string;
    checkOut?: string;
    streetNumber: string;
    neighborhood: string;
    owners: string[];
    hasOvernightStay: boolean;
    complement?: string;
    pricePerDay?: string;
    pricePerPerson?: string;
    pricePerPersonDay?: string;
    pricePerPersonHour?: string;
    pricingModel: "PER_PERSON" | "PER_DAY" | "PER_PERSON_DAY" | "PER_PERSON_HOUR";
  };
}

export interface UpdateVenueDTO {
  userId: string;
  venueId: string;
  cep?: string;
  email?: string;
  name?: string;
  url?: string;
  city?: string;
  state?: string;
  street?: string;
  checkIn?: string;
  tiktokUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  logoUrl?: string;
  logoFile?: File;
  maxGuest?: string;
  checkOut?: string;
  streetNumber?: string;
  neighborhood?: string;
  owners?: string[];
  hasOvernightStay?: boolean;
  complement?: string;
  pricePerDay?: string;
  pricePerPerson?: string;
  pricePerPersonDay?: string;
  pricePerPersonHour?: string;
  pricingModel: "PER_PERSON" | "PER_DAY" | "PER_PERSON_DAY" | "PER_PERSON_HOUR";
}

export type ItemListVenueResponse = {
  id: string;
  name: string;
  images: {
    imageUrl: string;
  }[];
  DateEvent: DateEvent[];
  _count: {
    DateEvent: number;
  };
};

export interface VenueDashboardData {
  totalEventsInYear: number;
  eventsThisMonth: number;
  proposalsInMonth: number;
  proposalsVariation: {
    value: number;
    isPositive: boolean;
  };
  totalVisits: number;
  visitsVariation: {
    value: number;
    isPositive: boolean;
  };
  monthlyRevenue: number;
  revenueVariation: {
    value: number;
    isPositive: boolean;
  };
  monthlyRevenueList: {
    month: number;
    revenue: number;
  }[] | null;
  nextEvent: {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    type: string;
    proposalId: string | null;
  } | null;
  nextVisit: {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    type: string;
    proposalId: string | null;
  } | null;
}


export interface VenueByIdResponse {
  success: true,
  message: string,
  data: Venue,
  count: number,
  type: string
}
export interface VenueDashboardByIdResponse {
  success: true,
  message: string,
  data: VenueDashboardData,
  count: number,
  type: string
}

export interface VenueListResponse {
  success: true,
  message: string,
  data: {
    venueList: ItemListVenueResponse[]
  },
  count: number,
  type: string
}

export interface VenueCreateResponse {
  success: true,
  message: string,
  data: Venue,
  count: number,
  type: string
}

export interface VenueDeleteResponse {
  success: true,
  message: string,
  data: Venue,
  count: number,
  type: string
}

export interface VenueUpdateResponse {
  success: true,
  message: string,
  data: Venue,
  count: number,
  type: string
}

export interface VenueAnalyticsResponse {
  success: boolean;
  message: string;
  data: {
    totalEvents: number;
    totalRevenue: number;
    averageGuests: number;
    monthlyStats: Array<{
      month: string;
      events: number;
      revenue: number;
      guests: number;
    }>;
  };
  count: number;
  type: string;
}

export interface TrafficSource {
  name: string;
  count: number;
}

export interface TrafficData {
  all: number;
  sortedSources: TrafficSource[];
}

export interface MonthData {
  month: string;
  count: number;
  total: number;
  guestNumber: number;
}

export interface AnalysisData {
  total: {
    count: number;
    total: number;
    guestNumber: number;
  };
  approved: {
    count: number;
    total: number;
    guestNumber: number;
  };
  analysisEventsByMonth: MonthData[];
  analysisProposalByMonth: MonthData[];
}

export interface GetVenueAnalysisByMonthParams {
  venueId: string;
  year: string;
  approved?: boolean;
}

export interface GetVenueTrafficCountParams {
  venueId: string;
  year: string;
  approved?: boolean;
}

export interface VenueAnalysisByMonthResponse {
  success: boolean;
  message: string;
  data: AnalysisData;
  count: number;
  type: string;
}

export interface VenueTrafficCountResponse {
  success: boolean;
  message: string;
  data: TrafficData;
  count: number;
  type: string;
}