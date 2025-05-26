import { Clause } from "./clause";
import { Organization } from "./organization";
import { Venue } from "./venue";

export interface Contract {
  id: string;
  name: string;
  title: string;
  organizationId: string;
  organization: Organization;
  venues: Venue[];
  clauses: Clause[];
};

export interface CreateContractDTO {
  title: string;
  name: string;
  organizationId?: string;
  venueIds?: string[];
  clauses: Clause[];
}

export interface UpdateContractDTO {
  title: string;
  name: string;
  contractId: string;
  venueIds: string[];
  clauses: Clause[];
}

export interface ContractByIdResponse {
  success: true,
  message: string,
  data: {
    contract: Contract
  },
  count: number,
  type: string
}

export interface ContractListResponse {
  success: true,
  message: string,
  data: {
    contractList: Contract[]
  },
  count: number,
  type: string
}

export interface ContractCreateResponse {
  success: true,
  message: string,
  data: Contract,
  count: number,
  type: string
}

export interface ContractDeleteResponse {
  success: true,
  message: string,
  data: Contract,
  count: number,
  type: string
}

export interface ContractUpdateResponse {
  success: true,
  message: string,
  data: Contract,
  count: number,
  type: string
}

export type DynamicField =
  | "owner.completeName"
  | "owner.rg"
  | "owner.cpf"
  | "owner.street"
  | "owner.streetNumber"
  | "owner.complement"
  | "owner.neighborhood"
  | "owner.city"
  | "owner.state"
  | "owner.cep"
  | "venue.name"
  | "client.name"
  | "client.cpf"
  | "client.cnpj"
  | "client.street"
  | "client.streetNumber"
  | "client.email"
  | "proposal.checkIn"
  | "proposal.checkOut"
  | "proposal.pricePerDay"
  | "proposal.pricePerPerson"
  | "proposal.maxGuests"
  | "proposal.startDate"
  | "proposal.endDate"
  | "proposal.basePrice"
  | "proposal.extraHours"
  | "proposal.extraHourPrice"
  | "proposal.totalPrice"
  | "proposal.guestCount"
  | "payment.installmentDay"
  | "payment.installmentCount"
  | "payment.downPayment"
  | "payment.installmentValue";
