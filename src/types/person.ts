export enum PersonType {
  WORKER = "WORKER",
  GUEST = "GUEST"
}

export interface Person {
  id: string;
  attendance: boolean;
  type: PersonType;
  name: string;
  email?: string;
  rg?: string;
  confirmAttendanceEmail: boolean;
  proposalId: string;
}

export interface VenueInfo {
  city: string;
  state: string;
  street: string;
  name: string;
  email: string;
  neighborhood: string;
  streetNumber: string;
}

export interface CreatePersonDTO {
  name: string;
  proposalId: string;
  rg?: string;
  email?: string;
  userId?: string;
  username?: string;
  type: PersonType;
  venueInfo?: VenueInfo;
}

export interface UpdatePersonDTO {
  personId: string;
  data: {
    rg?: string;
    name?: string;
    email?: string;
    attendance?: boolean;
    type?: PersonType;
  };
}

export interface ListPersonParams {
  proposalId: string;
  name?: string;
  type?: PersonType;
}

export interface PersonByIdResponse {
  success: true;
  message: string;
  data: Person;
  count: number;
  type: string;
}

export interface PersonListResponse {
  success: true;
  message: string;
  data: {
    personList: Person[];
  };
  count: number;
  type: string;
}

export interface PersonCreateResponse {
  success: true;
  message: string;
  data: Person;
  count: number;
  type: string;
}

export interface PersonDeleteResponse {
  success: true;
  message: string;
  data: Person;
  count: number;
  type: string;
}

export interface PersonUpdateResponse {
  success: true;
  message: string;
  data: Person;
  count: number;
  type: string;
}

export interface PersonCreateManyResponse {
  success: true;
  message: string;
  data: Person[];
  count: number;
  type: string;
} 