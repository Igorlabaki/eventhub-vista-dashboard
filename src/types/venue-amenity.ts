export interface VenueAmenity {
    id: string;
    name: string;
    position: number;
    description: string | null;
    imageUrl: string | null;
    videoUrl: string | null;
    venueId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateVenueAmenityDTO {
    venueId: string;
    name: string;
    description?: string | null;
    videoUrl?: string;
    file?: File;
}

export interface UpdateVenueAmenityDTO {
    amenityId: string;
    name: string;
    position?: number;
    description?: string | null;
    videoUrl?: string;
    file?: File;
    removeImage?: boolean;
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
