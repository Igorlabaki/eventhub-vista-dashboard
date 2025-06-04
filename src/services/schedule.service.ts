import { api } from "@/lib/axios";
import {
  Schedule,
  CreateScheduleDTO,
  UpdateScheduleDTO,
  ListScheduleParams,
  ScheduleByIdResponse,
  ScheduleListResponse,
  ScheduleCreateResponse,
  ScheduleDeleteResponse,
  ScheduleUpdateResponse,
} from "@/types/schedule";

export const scheduleService = {
  createSchedule: async (data: CreateScheduleDTO): Promise<ScheduleCreateResponse> => {
    const response = await api.post<ScheduleCreateResponse>("/schedule/create", data);
    return response.data;
  },

  getScheduleById: async (scheduleId: string): Promise<ScheduleByIdResponse> => {
    const response = await api.get<ScheduleByIdResponse>(`/schedule/getById/${scheduleId}`);
    return response.data;
  },

  updateSchedule: async (scheduleId: string, data: UpdateScheduleDTO): Promise<ScheduleUpdateResponse> => {
    const response = await api.put<ScheduleUpdateResponse>("/schedule/update", {
      scheduleId,
      data,
    });
    return response.data;
  },

  listSchedules: async (params: ListScheduleParams): Promise<ScheduleListResponse> => {
    const response = await api.get<ScheduleListResponse>(`/schedule/list?proposalId=${params.proposalId}${params.name ? `&name=${params.name}` : ""}`);
    return response.data;
  },

  deleteSchedule: async (scheduleId: string): Promise<ScheduleDeleteResponse> => {
    const response = await api.delete<ScheduleDeleteResponse>(`/schedule/delete/${scheduleId}`);
    return response.data;
  },
}; 