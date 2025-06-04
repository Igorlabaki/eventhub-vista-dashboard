export interface Service {
    id: string;
    name: string;
    price: number;
    venueId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateServiceDTO {
    name: string;
    price: number;
    venueId: string;
}

export interface UpdateServiceDTO {
    serviceId: string;
    data: {
        name?: string;
        price?: number;
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