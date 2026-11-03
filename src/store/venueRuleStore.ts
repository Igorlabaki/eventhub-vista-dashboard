import { create } from "zustand";
import { venueRuleService } from "@/services/venue-rule.service";
import { BackendResponse } from "@/lib/error-handler";
import { CreateVenueRuleDTO, UpdateVenueRuleDTO, VenueRule } from "@/types/venue-rule";

interface VenueRuleStore {
    rules: VenueRule[];
    isLoading: boolean;
    error: string | null;
    fetchRules: (venueId: string) => Promise<void>;
    createRule: (data: CreateVenueRuleDTO) => Promise<BackendResponse<VenueRule>>;
    updateRule: (data: UpdateVenueRuleDTO) => Promise<BackendResponse<VenueRule>>;
    deleteRule: (ruleId: string) => Promise<BackendResponse<VenueRule>>;
}

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
}

function sortRules(rules: VenueRule[]) {
    return [...rules].sort((a, b) => a.position - b.position || a.createdAt.localeCompare(b.createdAt));
}

export const useVenueRuleStore = create<VenueRuleStore>((set) => ({
    rules: [],
    isLoading: false,
    error: null,

    fetchRules: async (venueId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await venueRuleService.list(venueId);
            set({ rules: sortRules(response.data) });
        } catch (err: unknown) {
            const error = err as ApiError;
            set({
                error: error?.response?.data?.message || "Não foi possível carregar as regras.",
                rules: [],
            });
        } finally {
            set({ isLoading: false });
        }
    },

    createRule: async (data) => {
        const response = await venueRuleService.create(data);
        set((state) => ({ rules: sortRules([...state.rules, response.data]) }));
        return { success: true, message: response.message, data: response.data };
    },

    updateRule: async (data) => {
        const response = await venueRuleService.update(data);
        set((state) => ({
            rules: sortRules(state.rules.map((rule) => (rule.id === data.ruleId ? response.data : rule))),
        }));
        return { success: true, message: response.message, data: response.data };
    },

    deleteRule: async (ruleId) => {
        const response = await venueRuleService.delete(ruleId);
        set((state) => ({ rules: state.rules.filter((rule) => rule.id !== ruleId) }));
        return { success: true, message: response.message, data: response.data };
    },
}));
