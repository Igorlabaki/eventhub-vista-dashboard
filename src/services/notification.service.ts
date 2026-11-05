import { api } from "@/lib/axios";
import {
  NotificationListQuery,
  NotificationListResponse,
  NotificationReadResponse,
} from "@/types/notification";

export const notificationService = {
  getAllNotifications: async (venueId: string, query: NotificationListQuery) => {
    const response = await api.get<NotificationListResponse>(`/notification/list/${venueId}`, {
      params: {
        page: query.page,
        summary: true,
        q: query.q,
        type: query.type,
        isRead: query.isRead === undefined ? undefined : String(query.isRead),
      },
    });
    return response.data;
  },

  markReadByProposal: async (proposalId: string) => {
    const response = await api.patch<NotificationReadResponse>(`/notification/read-by-proposal/${proposalId}`);
    return response.data;
  },

  markAllRead: async (venueId: string) => {
    const response = await api.patch<NotificationReadResponse>(`/notification/read-all/${venueId}`);
    return response.data;
  },
};
