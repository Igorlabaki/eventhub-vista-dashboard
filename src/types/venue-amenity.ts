export interface VenueAmenity {
    id: string;
    name: string;
    position: number;
    venueId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateVenueAmenityDTO {
    venueId: string;
    name: string;
}

export interface UpdateVenueAmenityDTO {
    amenityId: string;
    name: string;
    position?: number;
}

export interface VenueAmenityResponse {
    success: true;
    message: string;
    data: VenueAmenity;
    count: number;
    type: string;
}

export interface VenueAmenityListResponse {
    success: true;
    message: string;
    data: VenueAmenity[];
    count: number;
    type: string;
}
