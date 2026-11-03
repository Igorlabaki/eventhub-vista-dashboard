export interface VenueRule {
    id: string;
    title: string | null;
    text: string;
    position: number;
    venueId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateVenueRuleDTO {
    venueId: string;
    title?: string | null;
    text: string;
}

export interface UpdateVenueRuleDTO {
    ruleId: string;
    title?: string | null;
    text: string;
    position?: number;
}

export interface VenueRuleResponse {
    success: true;
    message: string;
    data: VenueRule;
    count: number;
    type: string;
}

export interface VenueRuleListResponse {
    success: true;
    message: string;
    data: VenueRule[];
    count: number;
    type: string;
}
