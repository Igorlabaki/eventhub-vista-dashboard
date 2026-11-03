import { create } from "zustand";
import { venueAmenityService } from "@/services/venue-amenity.service";
import { BackendResponse } from "@/lib/error-handler";
import { CreateVenueAmenityDTO, UpdateVenueAmenityDTO, VenueAmenity } from "@/types/venue-amenity";

interface VenueAmenityStore {
    amenities: VenueAmenity[];
    isLoading: boolean;
    error: string | null;
    fetchAmenities: (venueId: string) => Promise<void>;
    createAmenity: (data: CreateVenueAmenityDTO) => Promise<BackendResponse<VenueAmenity>>;
    updateAmenity: (data: UpdateVenueAmenityDTO) => Promise<BackendResponse<VenueAmenity>>;
    deleteAmenity: (amenityId: string) => Promise<BackendResponse<VenueAmenity>>;
}

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
}

function sortAmenities(amenities: VenueAmenity[]) {
    return [...amenities].sort((a, b) => a.position - b.position || a.createdAt.localeCompare(b.createdAt));
}

export const useVenueAmenityStore = create<VenueAmenityStore>((set) => ({
    amenities: [],
    isLoading: false,
    error: null,

    fetchAmenities: async (venueId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await venueAmenityService.list(venueId);
            set({ amenities: sortAmenities(response.data) });
        } catch (err: unknown) {
            const error = err as ApiError;
            set({
                error: error?.response?.data?.message || "Não foi possível carregar as características.",
                amenities: [],
            });
        } finally {
            set({ isLoading: false });
        }
    },

    createAmenity: async (data) => {
        const response = await venueAmenityService.create(data);
        set((state) => ({ amenities: sortAmenities([...state.amenities, response.data]) }));
        return { success: true, message: response.message, data: response.data };
    },

    updateAmenity: async (data) => {
        const response = await venueAmenityService.update(data);
        set((state) => ({
            amenities: sortAmenities(state.amenities.map((item) => (item.id === data.amenityId ? response.data : item))),
        }));
        return { success: true, message: response.message, data: response.data };
    },

    deleteAmenity: async (amenityId) => {
        const response = await venueAmenityService.delete(amenityId);
        set((state) => ({ amenities: state.amenities.filter((item) => item.id !== amenityId) }));
        return { success: true, message: response.message, data: response.data };
    },
}));
