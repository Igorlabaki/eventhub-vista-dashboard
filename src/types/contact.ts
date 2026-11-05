import type { PartnerCategory } from "@/lib/partner-category";

export enum ContactType {
  TEAM_MEMBER = "TEAM_MEMBER",
  SUPPLIER = "SUPPLIER"
}

export type { PartnerCategory };

export interface Contact {
  id: string;
  name?: string;
  role?: string;
  whatsapp?: string;
  venueId: string;
  email?: string;
  type?: ContactType;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  url?: string;
  category?: PartnerCategory | null;
  logoUrl?: string | null;
  description?: string | null;
}

export interface CreateContactParams {
  name?: string;
  role?: string;
  venueId: string;
  whatsapp?: string;
  email?: string;
  type?: ContactType;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  url?: string;
  category?: PartnerCategory | null;
  description?: string | null;
}

export interface UpdateContactParams {
  contactId: string;
  data: {
    name?: string;
    role?: string;
    whatsapp?: string;
    email?: string;
    type?: ContactType;
    instagramUrl?: string;
    facebookUrl?: string;
    tiktokUrl?: string;
    url?: string;
    category?: PartnerCategory | null;
    description?: string | null;
    removeLogo?: boolean;
  };
}

export interface ListContactsParams {
  venueId: string;
  name?: string;
  type?: ContactType;
  q?: string;
  category?: PartnerCategory;
  page?: string;
  summary?: boolean;
}

export interface ContactListSummary {
  total: number;
  withLogo: number;
  withDescription: number;
}

export interface ContactListPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  data: Contact;
  count: number;
  type: string;
} 

export interface ContactByIdResponse {
  success: true,
  message: string,
  data: Contact,
  count: number,
  type: string
}

export interface ContactListResponse {
  success: true,
  message: string,
  data: {
      contactList: Contact[]
      summary?: ContactListSummary
  },
  count: number,
  pagination?: ContactListPagination,
  type: string
}

export interface ContactCreateResponse {
  success: true,
  message: string,
  data: Contact,
  count: number,
  type: string
}

export interface ContactDeleteResponse {
  success: true,
  message: string,
  data: Contact,
  count: number,
  type: string
}

export interface ContactUpdateResponse {
  success: true,
  message: string,
  data: Contact,
  count: number,
  type: string
}