import { api } from "@/lib/axios";
import {
    CreateVenueRuleDTO,
    UpdateVenueRuleDTO,
    VenueRuleListResponse,
    VenueRuleResponse,
} from "@/types/venue-rule";

export const venueRuleService = {
    list: async (venueId: string) => {
        const response = await api.get<VenueRuleListResponse>(`/venue-rule/list/${venueId}`);
        return response.data;
    },

    create: async (data: CreateVenueRuleDTO) => {
        const response = await api.post<VenueRuleResponse>("/venue-rule/create", data);
        return response.data;
    },

    update: async (data: UpdateVenueRuleDTO) => {
        const response = await api.put<VenueRuleResponse>("/venue-rule/update", data);
        return response.data;
    },

    delete: async (ruleId: string) => {
        const response = await api.delete<VenueRuleResponse>(`/venue-rule/delete/${ruleId}`);
        return response.data;
    },
};
