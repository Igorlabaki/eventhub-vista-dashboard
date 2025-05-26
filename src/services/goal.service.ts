import { api } from '@/lib/axios';
import { 
    CreateGoalDTO, 
    GoalListResponse, 
    GoalByIdResponse, 
    GoalUpdateResponse, 
    GoalCreateResponse, 
    GoalDeleteResponse 
} from '@/types/goal';

export const goalService = {
    createGoal: async (data: CreateGoalDTO) => {
        const response = await api.post<GoalCreateResponse>('/goal/create', data);
        return response.data;
    },

    getAllGoals: async (venueId?: string, minValue?: number) => {
        const response = await api.get<GoalListResponse>(`/goal/list?venueId=${venueId || ''}&minValue=${minValue || ''}`);
        return response.data;
    },

    getGoalById: async (goalId: string) => {
        const response = await api.get<GoalByIdResponse>(`/goal/getById/${goalId}`);
        return response.data;
    },

    updateGoal: async (goalId: string, data: Partial<CreateGoalDTO>) => {
        const response = await api.put<GoalUpdateResponse>(`/goal/update`, { goalId, data });
        return response.data;
    },

    deleteGoal: async (id: string) => {
        const response = await api.delete<GoalDeleteResponse>(`/goal/delete/${id}`);
        return response.data;
    }
}; 