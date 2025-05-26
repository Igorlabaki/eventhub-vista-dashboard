export enum ContactType {
  TEAM_MEMBER = "TEAM_MEMBER",
  SUPPLIER = "SUPPLIER"
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  whatsapp: string;
  venueId: string;
  email?: string;
  type?: ContactType;
}

export interface CreateContactParams {
  name: string;
  role: string;
  venueId: string;
  whatsapp: string;
  email?: string;
  type?: ContactType;
}

export interface UpdateContactParams {
  contactId: string;
  data: {
    name?: string;
    role?: string;
    whatsapp?: string;
    email?: string;
    type?: ContactType;
  };
}

export interface ListContactsParams {
  venueId: string;
  name?: string;
  type?: ContactType;
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
  },
  count: number,
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