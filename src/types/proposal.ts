import { Venue } from "@/components/ui/venue-list";
import { Payment } from "./payment";
import { DateEvent } from "./dateEvent";
import { Notification } from "./notification";
import { Service } from "./service";
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
  trafficSource: TrafficSource;
  guestNumber: number;
  knowsVenue: boolean;
  startDate: Date;
  endDate: Date;
  email: string;
  whatsapp: string;
  description: string;
  hostMessage?: string;
  basePrice: number;
  extraHoursQty: number;
  extraHourPrice: number;
  totalAmount: number;
  termsAccepted: boolean;
  approved: boolean;
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

export interface ProposalService {
  id: string;
  proposalId: string;
  serviceId: string;
  teste?: string | null;
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
  email: string;
  userId?: string;
  serviceIds: string[];
  totalAmountInput?: string;
  type: ProposalType;
  trafficSource: TrafficSource;
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
  email: string;
  userId?: string;
  serviceIds: string[];
  totalAmountInput?: string;
  type: ProposalType;
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
    email: string;
    totalAmountInput: string;
    userId?: string;
    serviceIds: string[];
    type: ProposalType;
    trafficSource: TrafficSource;
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
    email: string;
    totalAmountInput: string;
    userId?: string;
    serviceIds: string[];
    type: ProposalType;
    trafficSource: TrafficSource;
  }
}

export interface ListProposalParams {
  venueId: string;
  completeClientName?: string;
  email?: string;
  month?: string;
  year?: string;
  approved?: boolean;
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
  };
  count: number;
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
