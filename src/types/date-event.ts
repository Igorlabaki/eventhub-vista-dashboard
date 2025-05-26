import { Venue } from "@/components/ui/venue-list";

export type DateEvent = {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
    proposalId?: string;
    venueId: string;
    type: string; // ou enum DateEventType, se preferir
    venue?: Venue;
 /*    proposal?: {
      id: string;
      // outros campos da proposal se necessário
    }; */
/*     notifications?: {
      id: string;
      // outros campos da notification se necessário
    }[]; */
  };

/* export interface CreateOrganizationDTO {
    name: string;
    userId: string;
}

export interface OrganizationByIdResponse {
    success: true,
    message: string,
    data: {
        organization: Organization
    },
    count: number,
    type: string
}

export interface OrganizationListResponse {
    success: true,
    message: string,
    data: {
        organizationList: Organization[]
    },
    count: number,
    type: string
}

export interface OrganizationCreateResponse {
    success: true,
    message: string,
    data: Organization,
    count: number,
    type: string
}

export interface OrganizationDeleteResponse {
    success: true,
    message: string,
    data: Organization,
    count: number,
    type: string
}

export interface OrganizationUpdateResponse {
    success: true,
    message: string,
    data: Organization,
    count: number,
    type: string
} */