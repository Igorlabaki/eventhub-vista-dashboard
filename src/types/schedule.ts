export interface Schedule {
  id: string;
  name: string;
  workerNumber: number;
  description?: string;
  startHour: string;
  endHour: string;
  proposalId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleDTO {
  name: string;
  workerNumber: number;
  description?: string;
  startHour: string;
  endHour: string;
  proposalId: string;
}

export interface UpdateScheduleDTO {
  name?: string;
  workerNumber?: number;
  description?: string;
  startHour?: string;
  endHour?: string;
}

export interface ListScheduleParams {
  proposalId: string;
  name?: string;
}

export interface ScheduleByIdResponse {
  success: boolean;
  data: Schedule;
  message: string;
}

export interface ScheduleListResponse {
  success: boolean;
  data: {
    scheduleList: Schedule[];
  };
  message: string;
}

export interface ScheduleCreateResponse {
  success: boolean;
  data: Schedule;
  message: string;
}

export interface ScheduleDeleteResponse {
  success: boolean;
  data: null;
  message: string;
}

export interface ScheduleUpdateResponse {
  success: boolean;
  data: Schedule;
  message: string;
} 