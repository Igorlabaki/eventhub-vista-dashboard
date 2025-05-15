import { Organization } from "./organization";


export interface Venue {
    id: string;
    name: string;
    email?: string | null;
    url?: string | null;
    street: string;
    streetNumber: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
    checkIn?: string | null;
    checkOut?: string | null;
    cep: string;
    hasOvernightStay: boolean;
    createdAt: Date;
    organizationId: string;
    pricingModel: string; // Se for enum, troque para o tipo do enum
    pricePerPerson?: number | null;
    pricePerDay?: number | null;
    pricePerPersonDay?: number | null;
    pricePerPersonHour?: number | null;
    maxGuest: number;

    // Relacionamentos (ajuste os tipos conforme seus models)
    organization: Organization;
    /*texts: any[];
    contacts: any[];
    images: any[];
    expenses: any[];
    services: any[];
    Payment: any[];
    questions: any[];
    proposals: any[];
    DateEvent: any[];
    ownerVenue: any[];
    notifications: any[];
    UserPermission: any[];
    seasonalFee: any[];
    contracts: any[];
    attachments: any[];
    goals: any[]; */
};

export interface CreateVenueDTO {
    userId: string;
    organizationId: string;
    data: {
        cep: string;
        email: string;
        name: string;
        city: string;
        state: string;
        street: string;
        checkIn?: string;
        maxGuest: string;
        checkOut?: string;
        streetNumber: string;
        neighborhood: string;
        owners: string[];
        hasOvernightStay: boolean;
        complement?: string;
        pricePerDay?: string;
        pricePerPerson?: string;
        pricePerPersonDay?: string;
        pricePerPersonHour?: string;
        pricingModel: "PER_PERSON" | "PER_DAY" | "PER_PERSON_DAY" | "PER_PERSON_HOUR";
    };
}

export interface VenueByIdResponse {
    success: true,
    message: string,
    data: Venue,
    count: number,
    type: string
}

export interface VenueListResponse {
    success: true,
    message: string,
    data: {
        venueList: Venue[]
    },
    count: number,
    type: string
}

export interface VenueCreateResponse {
    success: true,
    message: string,
    data: Venue,
    count: number,
    type: string
}

export interface VenueDeleteResponse {
    success: true,
    message: string,
    data: Venue,
    count: number,
    type: string
}

export interface VenueUpdateResponse {
    success: true,
    message: string,
    data: Venue,
    count: number,
    type: string
}