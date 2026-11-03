import { api } from "@/lib/axios";
import {
    CreateVenueAmenityDTO,
    UpdateVenueAmenityDTO,
    VenueAmenityListResponse,
    VenueAmenityResponse,
} from "@/types/venue-amenity";

export const venueAmenityService = {
    list: async (venueId: string) => {
        const response = await api.get<VenueAmenityListResponse>(`/venue-amenity/list/${venueId}`);
        return response.data;
    },

    create: async (data: CreateVenueAmenityDTO) => {
        const response = await api.post<VenueAmenityResponse>("/venue-amenity/create", data);
        return response.data;
    },

    update: async (data: UpdateVenueAmenityDTO) => {
        const response = await api.put<VenueAmenityResponse>("/venue-amenity/update", data);
        return response.data;
    },

    delete: async (amenityId: string) => {
        const response = await api.delete<VenueAmenityResponse>(`/venue-amenity/delete/${amenityId}`);
        return response.data;
    },
};
