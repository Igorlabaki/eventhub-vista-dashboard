import { Venue } from "./venue";

export interface Goal {
    id: string;
    minValue: number;
    maxValue: number | null;
    increasePercent: number;
    months: string;
    venueId: string;
    createdAt: Date;
    updatedAt: Date;
    venue?: Venue;
}

export interface CreateGoalDTO {
    minValue: number;
    maxValue?: number;
    increasePercent: number;
    months: string;
    venueId: string;
}

export interface UpdateGoalDTO {
    goalId: string;
    data: {
        minValue?: number;
        maxValue?: number;
        increasePercent?: number;
        months?: string;
    };
}

export interface GoalByIdResponse {
    success: true;
    message: string;
    data: {
        goal: Goal;
    };
    count: number;
    type: string;
}

export interface GoalListResponse {
    success: true;
    message: string;
    data: {
        goalList: Goal[];
    };
    count: number;
    type: string;
}

export interface GoalCreateResponse {
    success: true;
    message: string;
    data: Goal;
    count: number;
    type: string;
}

export interface GoalDeleteResponse {
    success: true;
    message: string;
    data: Goal;
    count: number;
    type: string;
}

export interface GoalUpdateResponse {
    success: true;
    message: string;
    data: Goal;
    count: number;
    type: string;
} 