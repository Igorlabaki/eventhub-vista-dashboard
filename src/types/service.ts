export type ServicePricingType = "FIXED" | "PER_HOUR" | "PER_PERSON";

export interface Service {
    id: string;
    name: string;
    price: number;
    pricingType?: ServicePricingType;
    description?: string | null;
    imageUrl?: string | null;
    venueId: string;
    createdAt: Date;
    updatedAt: Date;
    rpaRequired: boolean,
    rpaMinPeople?: number,
}

export interface CreateServiceDTO {
    name: string;
    price: number;
    venueId: string;
    pricingType?: ServicePricingType;
    description?: string | null;
    file?: File;
    rpaRequired?: boolean;
    rpaMinPeople?: number | null;
}

export interface UpdateServiceDTO {
    serviceId: string;
    file?: File;
    data: {
        name?: string;
        price?: number;
        pricingType?: ServicePricingType;
        description?: string | null;
        removeImage?: boolean;
        rpaRequired?: boolean;
        rpaMinPeople?: number | null;
    };
}

export interface ServiceByIdResponse {
    success: true,
    message: string,
    data: {
        service: Service
    },
    count: number,
    type: string
}

export interface ServiceListResponse {
    success: true,
    message: string,
    data: {
        serviceList: Service[]
    },
    count: number,
    type: string
}

export interface ServiceCreateResponse {
    success: true,
    message: string,
    data: Service,
    count: number,
    type: string
}

export interface ServiceDeleteResponse {
    success: true,
    message: string,
    data: Service,
    count: number,
    type: string
}

export interface ServiceUpdateResponse {
    success: true,
    message: string,
    data: Service,
    count: number,
    type: string
} 