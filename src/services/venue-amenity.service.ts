import { api } from "@/lib/axios";
import { amenityFormData } from "@/lib/amenity-form";
import {
    CreateVenueAmenityDTO,
    UpdateVenueAmenityDTO,
    VenueAmenityListResponse,
    VenueAmenityResponse,
} from "@/types/venue-amenity";

const multipart = { headers: { "Content-Type": "multipart/form-data" } };

export const venueAmenityService = {
    list: async (venueId: string) => {
        const response = await api.get<VenueAmenityListResponse>(`/venue-amenity/list/${venueId}`);
        return response.data;
    },

    create: async (data: CreateVenueAmenityDTO) => {
        const { files, ...payload } = data;
        const response = await api.post<VenueAmenityResponse>("/venue-amenity/create", amenityFormData(payload, files), multipart);
        return response.data;
    },

    update: async (data: UpdateVenueAmenityDTO) => {
        const { files, ...payload } = data;
        const response = await api.put<VenueAmenityResponse>("/venue-amenity/update", amenityFormData(payload, files), multipart);
        return response.data;
    },

    delete: async (amenityId: string) => {
        const response = await api.delete<VenueAmenityResponse>(`/venue-amenity/delete/${amenityId}`);
        return response.data;
    },
};
