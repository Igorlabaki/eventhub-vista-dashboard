import { api } from '@/lib/axios';
import {
  CreateGoalDTO,
  GoalListResponse,
  GoalByIdResponse,
  GoalUpdateResponse,
  GoalCreateResponse,
  GoalDeleteResponse,
  UpdateGoalDTO
} from '@/types/goal';

export const goalService = {
  createGoal: async (data: CreateGoalDTO) => {
    const response = await api.post<GoalCreateResponse>('/goal/create', data);
    return response.data;
  },

  getGoalsList: async (venueId: string, minValue?: number) => {
    const url = minValue !== undefined ? `/goal/list?venueId=${venueId}&minValue=${minValue}` : `/goal/list?venueId=${venueId}`;
    const response = await api.get<GoalListResponse>(url);
    return response.data;
  },

  getGoalById: async (goalId: string) => {
    const response = await api.get<GoalByIdResponse>(`/goal/getById/${goalId}`);
    return response.data;
  },

  updateGoal: async (data: UpdateGoalDTO) => {
    const response = await api.put<GoalUpdateResponse>(`/goal/update`, data);
    return response.data;
  },

  deleteGoal: async (goalId: string) => {
    const response = await api.delete<GoalDeleteResponse>(`/goal/delete/${goalId}`);
    return response.data;
  }
}; 