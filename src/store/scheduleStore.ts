import { create } from "zustand";
import {
  Schedule,
  CreateScheduleDTO,
  UpdateScheduleDTO,
  ListScheduleParams,
} from "@/types/schedule";
import { scheduleService } from "@/services/schedule.service";

interface ScheduleStore {
  schedules: Schedule[];
  currentSchedule: Schedule | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSchedules: (proposalId: string) => Promise<void>;
  createSchedule: (data: CreateScheduleDTO) => Promise<Schedule>;
  updateSchedule: (id: string, data: UpdateScheduleDTO) => Promise<Schedule>;
  deleteSchedule: (id: string) => Promise<void>;
  setCurrentSchedule: (schedule: Schedule | null) => void;
  clearError: () => void;
}

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  schedules: [],
  currentSchedule: null,
  isLoading: false,
  error: null,

  fetchSchedules: async (proposalId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await scheduleService.listSchedules({ proposalId });
     
      set({ schedules: response.data.scheduleList || [], isLoading: false });
    } catch (error) {
     
      set({ error: "Erro ao carregar cronogramas", isLoading: false });
      throw error;
    }
  },

  createSchedule: async (data: CreateScheduleDTO) => {
    set({ isLoading: true, error: null });
    try {
      const response = await scheduleService.createSchedule(data);
      set((state) => ({
        schedules: [...state.schedules, response.data],
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({ error: "Erro ao criar cronograma", isLoading: false });
      throw error;
    }
  },

  updateSchedule: async (id: string, data: UpdateScheduleDTO) => {
    set({ isLoading: true, error: null });
    try {
      const response = await scheduleService.updateSchedule(id, data);
      set((state) => ({
        schedules: state.schedules.map((schedule) =>
          schedule.id === id ? response.data : schedule
        ),
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({ error: "Erro ao atualizar cronograma", isLoading: false });
      throw error;
    }
  },

  deleteSchedule: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await scheduleService.deleteSchedule(id);
      set((state) => ({
        schedules: state.schedules.filter((schedule) => schedule.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Erro ao excluir cronograma", isLoading: false });
      throw error;
    }
  },

  setCurrentSchedule: (schedule: Schedule | null) => {
    set({ currentSchedule: schedule });
  },

  clearError: () => {
    set({ error: null });
  },
})); 