import { Venue } from "@/components/ui/venue-list";
import { Payment } from "./payment";
import { DateEvent } from "./dateEvent";
import { Notification } from "./notification";
import { Service, ServicePricingType } from "./service";
import { Schedule } from "./schedule";
import { Document, DocumentType } from "./document";
import { Person } from "./person";
import { Owner } from "./owner";


export enum ProposalType {
  EVENT = "EVENT",
  OVERNIGHT = "OVERNIGHT",
  PRODUCTION = "PRODUCTION",
  BARTER = "BARTER",
  OTHER = "OTHER"
}

export enum EventCategory {
  CORPORATE = "CORPORATE",
  BIRTHDAY = "BIRTHDAY",
  BACHELOR_PARTY = "BACHELOR_PARTY",
  WEDDING = "WEDDING",
  COFFEE_BREAK = "COFFEE_BREAK",
  OTHER = "OTHER"
}

export enum TrafficSource {
  AIRBNB = "AIRBNB",
  GOOGLE = "GOOGLE",
  INSTAGRAM = "INSTAGRAM",
  TIKTOK = "TIKTOK",
  OTHER = "OTHER",
  FRIEND = "FRIEND",
  FACEBOOK = "FACEBOOK"
}

// Definição local do tipo History
export type History = {
  id: string;
  action: string;
  createdAt: string;
  proposalId: string;
  userId?: string | null;
  username?: string | null;
};

export interface Proposal {
  id: string;
  completeCompanyName?: string;
  completeClientName: string;
  cpf?: string;
  cnpj?: string;
  rg?: string;
  street?: string;
  streetNumber?: string;
  neighborhood?: string;
  cep?: string;
  city?: string;
  state?: string;
  type: ProposalType;
  eventCategory?: EventCategory | null;
  trafficSource: TrafficSource;
  guestNumber: number;
  knowsVenue: boolean;
  adressComplement?: string;
  startDate: Date;
  endDate: Date;
  email: string | null;
  whatsapp: string;
  description: string;
  hostMessage?: string;
  basePrice: number;
  extraHoursQty: number;
  extraHourPrice: number;
  totalAmount: number;
  discountPercent?: number;
  discountAmount?: number;
  termsAccepted: boolean;
  approved: boolean;
  status?: "ABERTO" | "FECHADO";
  createdAt: Date;
  updatedAt: Date;
  contact?: boolean;
  paid?: boolean;
  amountPaid?: number;
  venueId: string;
  organizationId: string;
  venue: Venue;
  dateEvents: DateEvent[];
  noificationList: Notification[];
  histories?: History[];
  personList: Person[];
  payments: Payment[];
  proposalServices: ProposalService[];
  schedules: Schedule[];
  documents: Document[];
  owners: Owner[];
}

export interface ServiceCourtesyInput {
  serviceId: string;
  quantity: number;
}

export interface ProposalService {
  id: string;
  proposalId: string;
  serviceId: string;
  teste?: string | null;
  pricingType?: ServicePricingType | null;
  unitPrice?: number | null;
  quantity?: number | null;
  courtesyQuantity?: number | null;
  amount?: number | null;
  joinedAt: Date;
  service?: Service;
  proposal?: Proposal;
}

export interface CreateProposalPerPersonDTO {
  date: string;
  completeClientName: string;
  venueId: string;
  endHour: string;
  whatsapp: string;
  startHour: string;
  guestNumber: string;
  description: string;
  knowsVenue: boolean;
  email: string | null;
  userId?: string;
  serviceIds: string[];
  serviceHours?: { serviceId: string; hours: number }[];
  serviceCourtesy?: ServiceCourtesyInput[];
  totalAmountInput?: string;
  discountPercent?: number;
  type: ProposalType;
  eventCategory?: EventCategory | null;
  trafficSource: TrafficSource;
}

export interface ProposalQuoteInput {
  venueId: string;
  date: string;
  startHour: string;
  endHour: string;
  guestNumber: number;
  serviceIds: string[];
  serviceHours: { serviceId: string; hours: number }[];
  serviceCourtesy?: ServiceCourtesyInput[];
  type: ProposalType;
}

export interface ProposalQuote {
  basePrice: number;
  extraHoursQty: number;
  extraHourPrice: number;
  totalAmountService: number;
  totalAmount: number;
  minimumApplied: boolean;
}

export interface CreateProposalPerDayDTO {
  completeClientName: string;
  venueId: string;
  endHour: string;
  endDay: string;
  startDay: string;
  whatsapp: string;
  startHour: string;
  description: string;
  knowsVenue: boolean;
  guestNumber: string;
  email: string | null;
  userId?: string;
  serviceIds: string[];
  serviceHours?: { serviceId: string; hours: number }[];
  serviceCourtesy?: ServiceCourtesyInput[];
  totalAmountInput?: string;
  type: ProposalType;
  eventCategory?: EventCategory | null;
  trafficSource: TrafficSource;
}

export interface UpdateProposalPersonalInfoDTO {
  proposalId: string;
  data: {
    cpf: string;
    cep: string;
    city: string;
    state: string;
    street: string;
    streetNumber: string;
    neighborhood: string;
    rg?: string;
    cnpj?: string;
    completeClientName: string;
    completeCompanyName?: string;
    adressComplement?: string;
    email: string;
  }
}

export interface UpdateProposalPerDayDTO {
  proposalId: string;
  data: {
    completeClientName: string;
    completeCompanyName?: string;
    venueId: string;
    endHour: string;
    endDay: string;
    startDay: string;
    whatsapp: string;
    startHour: string;
    guestNumber: string;
    description: string;
    knowsVenue: boolean;
    email: string | null;
    totalAmountInput: string;
    userId?: string;
    serviceIds: string[];
    serviceHours?: { serviceId: string; hours: number }[];
    serviceCourtesy?: ServiceCourtesyInput[];
    type: ProposalType;
    eventCategory?: EventCategory | null;
    trafficSource: TrafficSource;
    adressComplement?: string;
  }
}

export interface UpdateProposalPerPersonDTO {
  proposalId: string;
  data: {
    completeClientName: string;
    completeCompanyName?: string;
    date: string;
    venueId: string;
    endHour: string;
    whatsapp: string;
    startHour: string;
    guestNumber: string;
    description: string;
    knowsVenue: boolean;
    email: string | null;
    totalAmountInput: string;
    discountPercent?: number;
    userId?: string;
    serviceIds: string[];
    serviceHours?: { serviceId: string; hours: number }[];
    serviceCourtesy?: ServiceCourtesyInput[];
    type: ProposalType;
    eventCategory?: EventCategory | null;
    trafficSource: TrafficSource;
  }
}

export interface ListProposalParams {
  venueId: string;
  completeClientName?: string;
  email?: string;
  whatsapp?: string;
  month?: string;
  year?: string;
  day?: string;
  page?: string;
  sortBy?: "startDate" | "totalAmount" | "status";
  sortDir?: "asc" | "desc";
  summary?: boolean;
  approved?: boolean;
  minAmount?: number;
}

export interface ProposalListDailyPoint {
  day: number;
  count: number;
  amount: number;
  conversionRate: number;
}

export interface ProposalListChange {
  total: number | null;
  monthAmount: number | null;
  conversionRate: number | null;
}

export interface ProposalListSummary {
  total: number;
  monthAmount: number;
  amountMax: number;
  conversionRate: number;
  daily: ProposalListDailyPoint[];
  change?: ProposalListChange;
}

export interface ProposalListPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ProposalByIdResponse {
  success: true;
  message: string;
  data: Proposal;
  count: number;
  type: string;
}

export interface ProposalListResponse {
  success: true;
  message: string;
  data: {
    proposalList: Proposal[];
    summary?: ProposalListSummary;
  };
  count: number;
  pagination?: ProposalListPagination;
  type: string;
}

export interface ProposalCreateResponse {
  success: true;
  message: string;
  data: Proposal;
  count: number;
  type: string;
}

export interface ProposalDeleteResponse {
  success: true;
  message: string;
  data: Proposal;
  count: number;
  type: string;
}

export interface ProposalUpdateResponse {
  success: true;
  message: string;
  data: Proposal;
  count: number;
  type: string;
} 
