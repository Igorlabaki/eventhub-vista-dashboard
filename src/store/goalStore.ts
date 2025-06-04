import { create } from 'zustand';
import {
  Goal,
  GoalListResponse,
  GoalByIdResponse,
  GoalCreateResponse,
  GoalDeleteResponse,
  GoalUpdateResponse,
  CreateGoalDTO,
  UpdateGoalDTO
} from '@/types/goal';
import { goalService } from '@/services/goal.service';

interface GoalStore {
  goals: Goal[];
  currentGoal: Goal | null;
  isLoading: boolean;
  error: string | null;
  setGoals: (goals: Goal[]) => void;
  setCurrentGoal: (goal: Goal | null) => void;
  fetchGoals: (venueId: string, minValue?: number) => Promise<void>;
  fetchGoalById: (goalId: string) => Promise<void>;
  createGoal: (data: CreateGoalDTO) => Promise<GoalCreateResponse>;
  updateGoal: (data: UpdateGoalDTO) => Promise<GoalUpdateResponse>;
  deleteGoal: (goalId: string) => Promise<GoalDeleteResponse>;
  addGoal: (goal: Goal) => void;
  updateGoalInStore: (goal: Goal) => void;
  removeGoal: (goalId: string) => void;
  clearError: () => void;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useGoalStore = create<GoalStore>((set, get) => ({
  goals: [],
  currentGoal: null,
  isLoading: false,
  error: null,

  setGoals: (goals) => set({ goals }),
  setCurrentGoal: (goal) => set({ currentGoal: goal }),

  fetchGoals: async (venueId: string, minValue?: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await goalService.getGoalsList(venueId, minValue);
      set({ goals: response.data.goalList });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Não foi possível carregar as metas.",
        goals: []
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchGoalById: async (goalId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await goalService.getGoalById(goalId);
      set({ currentGoal: response.data.goal });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Não foi possível carregar a meta.",
        currentGoal: null
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createGoal: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await goalService.createGoal(data);
      set((state) => ({
        goals: [...state.goals, response.data],
        isLoading: false
      }));
      return response;
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Não foi possível criar a meta.",
        isLoading: false
      });
      throw err;
    }
  },

  updateGoal: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await goalService.updateGoal(data);
      set((state) => ({
        goals: state.goals.map((g) => g.id === data.goalId ? response.data : g),
        currentGoal: state.currentGoal && state.currentGoal.id === data.goalId ? response.data : state.currentGoal,
        isLoading: false
      }));
      return response;
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Não foi possível atualizar a meta.",
        isLoading: false
      });
      throw err;
    }
  },

  deleteGoal: async (goalId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await goalService.deleteGoal(goalId);
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== goalId),
        currentGoal: state.currentGoal && state.currentGoal.id === goalId ? null : state.currentGoal,
        isLoading: false
      }));
      return response;
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Não foi possível excluir a meta.",
        isLoading: false
      });
      throw err;
    }
  },

  addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),

  updateGoalInStore: (goal) => set((state) => ({
    goals: state.goals.map((g) => g.id === goal.id ? goal : g),
    currentGoal: state.currentGoal && state.currentGoal.id === goal.id ? goal : state.currentGoal,
  })),

  removeGoal: (goalId) => set((state) => ({
    goals: state.goals.filter((g) => g.id !== goalId),
    currentGoal: state.currentGoal && state.currentGoal.id === goalId ? null : state.currentGoal,
  })),

  clearError: () => set({ error: null }),
})); 