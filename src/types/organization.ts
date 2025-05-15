import { Venue } from "@/components/ui/venue-list";

export interface Organization {
    id: string;
    name: string;
    createdAt: string;
    venues: Venue[];
    /*owners: Owner[];
    userOrganizations: UserOrganization[];
    clauses: Clause[];
    contracts: Contract[];
    attachments: Attachment[]; */
}

export interface CreateOrganizationDTO {
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
}