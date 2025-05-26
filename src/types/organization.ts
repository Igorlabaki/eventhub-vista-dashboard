import { Venue } from "@/components/ui/venue-list";
import { Clause } from "./clause";
import { Owner } from "./owner";
import { Contract } from "./contract";
import { Attachment } from "./attachment";

export interface Organization {
    id: string;
    name: string;
    createdAt: string;
    venues: Venue[];
    owners: Owner[];
    clauses: Clause[];
    contracts: Contract[];
    attachments: Attachment[];
}
export interface CreateOrganizationDTO {
    name: string;
    userId: string;
}

export type OrganizationWithVenueCount = Organization & {
    _count?: {
        venues: number
    }
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
        organizationList: OrganizationWithVenueCount[]
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
}