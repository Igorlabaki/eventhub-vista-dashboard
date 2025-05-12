
export interface Owner {
  id: string;
  completeName: string;
  rg: string | null;
  cpf: string;
  pix: string;
  street: string;
  streetNumber: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  bankName: string;
  bankAgency: string;
  cep: string;
  bankAccountNumber: string;
  organizationId: string;
  venues?: string[];
  createdAt?: Date;
}
