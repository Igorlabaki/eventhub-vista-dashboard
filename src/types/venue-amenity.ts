export interface VenueAmenityImage {
    id: string;
    imageUrl: string;
    position: number;
}

export type AmenityImageRef = { id: string } | { newIndex: number };

export interface VenueAmenity {
    id: string;
    name: string;
    position: number;
    description: string | null;
    images: VenueAmenityImage[];
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
    files?: File[];
}

export interface UpdateVenueAmenityDTO {
    amenityId: string;
    name: string;
    position?: number;
    description?: string | null;
    videoUrl?: string;
    images?: AmenityImageRef[];
    files?: File[];
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
