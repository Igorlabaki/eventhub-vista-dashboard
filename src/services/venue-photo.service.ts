import { api } from "@/lib/axios";
import { VenuePhoto, VenuePhotoUsages } from "@/types/venue-photo";

type Envelope<T> = { success: boolean; message: string; data: T; count: number };

export const venuePhotoService = {
    list: async (venueId: string) => {
        const response = await api.get<Envelope<VenuePhoto[]>>("/venue-photo/list", { params: { venueId } });
        return response.data;
    },

    upload: async (venueId: string, files: File[]) => {
        const body = new FormData();
        body.append("venueId", venueId);
        files.forEach((file) => body.append("files", file));
        const response = await api.post<Envelope<VenuePhoto[]>>("/venue-photo/upload", body, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    updateDescription: async (id: string, description: string) => {
        const response = await api.put<Envelope<VenuePhoto>>(`/venue-photo/${id}`, { description });
        return response.data;
    },

    usages: async (id: string) => {
        const response = await api.get<Envelope<VenuePhotoUsages>>(`/venue-photo/${id}/usages`);
        return response.data;
    },

    remove: async (id: string) => {
        const response = await api.delete<Envelope<{ id: string }>>(`/venue-photo/${id}`);
        return response.data;
    },
};
