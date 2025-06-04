import { Venue } from "@/components/ui/venue-list";

import { Notification } from "./notification";
import { Proposal } from "./proposal";

export enum DateEventType {
  VISIT = "VISIT",
  EVENT = "EVENT",
  OTHER = "OTHER",
  BARTER = "BARTER",
  PROPOSAL = "PROPOSAL",
  OVERNIGHT = "OVERNIGHT",
  PRODUCTION = "PRODUCTION"
}

export interface DateEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  proposalId?: string;
  venueId: string;
  type: DateEventType;
  venue: Venue;
  proposal?: Proposal;
  notifications: Notification[];
}

export interface CreateDateEventDTO {
  userId: string;
  venueId: string;
  username: string;
  proposalId?: string;
  data:{
    title: string;
    startDay: string;
    endDay: string;
    startHour: string;
    endHour: string;
    type: DateEventType;
  }
}

export interface DateEventListResponse {
  success: true;
  message: string;
  data: {
    dateEventList: DateEvent[];
  };
  count: number;
  type: string;
}

export interface DateEventByIdResponse {
  success: true;
  message: string;
  data: {
    dateEvent: DateEvent;
  };
  count: number;
  type: string;
}

export interface DateEventCreateResponse {
  success: true;
  message: string;
  data: DateEvent;
  count: number;
  type: string;
}

export interface DateEventDeleteResponse {
  success: true;
  message: string;
  data: DateEvent;
  count: number;
  type: string;
}

export interface DateEventUpdateResponse {
  success: true;
  message: string;
  data: DateEvent;
  count: number;
  type: string;
} 