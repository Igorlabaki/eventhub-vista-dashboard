import { z } from "zod";
import { Venue } from "./venue";

const ownerDocumentFieldsSchema = {
    personType: z.enum(["PF", "PJ"]).optional(),
    companyName: z.string().nullable().optional(),
    cnpj: z.string().nullable().optional(),
    companySize: z.enum(["MEI", "ME", "EPP", "DEMAIS"]).nullable().optional(),
};

export const createVenueOwnerSchema = z.object({
    ...ownerDocumentFieldsSchema,
    cep: z.string(),
    pix: z.string(),
    cpf: z.string(),
    city: z.string(),
    state: z.string(),
    street: z.string(),
    venueId: z.string(),
    bankName: z.string(),
    bankAgency: z.string(),
    streetNumber: z.string(),
    neighborhood: z.string(),
    completeName: z.string(),
    rg: z.string().optional(),
    organizationId: z.string(),
    bankAccountNumber: z.string(),
    complement: z.string().optional(),
});

export type CreateVenueOwnerRequestParams = z.infer<typeof createVenueOwnerSchema>;

export const createOrganizationOwnerSchema = z.object({
    ...ownerDocumentFieldsSchema,
    cep: z.string(),
    pix: z.string(),
    cpf: z.string(),
    city: z.string(),
    state: z.string(),
    street: z.string(),
    bankName: z.string(),
    bankAgency: z.string(),
    streetNumber: z.string(),
    completeName: z.string(),
    neighborhood: z.string(),
    rg: z.string().optional(),
    organizationId: z.string(),
    bankAccountNumber: z.string(),
    complement: z.string().optional(),
});

export type CreateOrganizationOwnerRequestParams = z.infer<typeof createOrganizationOwnerSchema>;

export const listOwnerByVenueIdQuerySchema = z.object({
    venueId: z.string(), 
    organizationId: z.string(),
    completeName: z.string().optional(),
});

export type ListOwnerByVenueIdQuerySchema = z.infer<typeof listOwnerByVenueIdQuerySchema>;

export type OwnerPersonType = "PF" | "PJ";

export type CompanySize = "MEI" | "ME" | "EPP" | "DEMAIS";

/** Em PJ, `completeName`, `cpf` e `rg` sao do representante legal (ou titular, no MEI). */
export interface OwnerDocumentFields {
    personType?: OwnerPersonType;
    companyName?: string | null;
    cnpj?: string | null;
    companySize?: CompanySize | null;
}

export interface Owner extends OwnerDocumentFields {
    id: string;
    completeName: string;
    cpf: string;
    rg?: string;
    street: string;
    streetNumber: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
    bankName: string;
    bankAgency: string;
    bankAccountNumber: string;
    pix: string;
    organizationId: string;
    venueId?: string;
    createdAt: string;
    updatedAt: string;
    ownerVenue: OwnerVenue[];
}

export interface OwnerVenue{
  id: string;
  ownerId: string;
  venueId: string;
  role: string;         
  joinedAt: Date;
  owner?: Owner;
  venue: Venue;           
};

export interface CreateOwnerDTO extends OwnerDocumentFields {
    completeName: string;
    cpf: string;
    rg?: string;
    street: string;
    streetNumber: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
    bankName: string;
    bankAgency: string;
    bankAccountNumber: string;
    pix: string;
    organizationId: string;
    venueIds?: string[];
}

export interface UpdateOwnerDTO extends OwnerDocumentFields {
    completeName?: string;
    cpf?: string;
    rg?: string;
    street?: string;
    streetNumber?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    cep?: string;
    bankName?: string;
    bankAgency?: string;
    bankAccountNumber?: string;
    pix?: string;
    venueIds?: string[];
}

export interface OwnerByIdResponse {
  success: true,
  message: string,
  data: {
      owner: Owner
  },
  count: number,
  type: string
}

export interface OwnerListResponse {
  success: true,
  message: string,
  data: {
    ownerByOrganizationList: Owner[]
  },
  count: number,
  type: string
}
export interface OwnerVenueListResponse {
  success: true,
  message: string,
  data: {
    ownerByVenueList: Owner[]
  },
  count: number,
  type: string
}

export interface OwnerCreateResponse {
  success: true,
  message: string,
  data: Owner,
  count: number,
  type: string
}

export interface OwnerDeleteResponse {
  success: true,
  message: string,
  data: Owner,
  count: number,
  type: string
}

export interface OwnerUpdateResponse {
  success: true,
  message: string,
  data: Owner,
  count: number,
  type: string
}
