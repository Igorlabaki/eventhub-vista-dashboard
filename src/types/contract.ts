
export interface Clause {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
}

export interface Attachment {
  id: string;
  title: string;
  content: string;
  venueIds: string[];
  createdAt: Date;
  organizationId?: string;
}

export interface Contract {
  id: string;
  name: string;
  description?: string;
  clauses: Clause[];
  venueIds: string[];
  createdAt: Date;
  organizationId: string;
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
